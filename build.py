from ast import dump
import time
import sys
import importlib
import os
import json
import shutil
from itertools import chain
from pypinyin import pinyin, Style

if(len(sys.argv) == 1):
    print('no origin data folder')
    exit()

importlib.reload(sys)

origin_dir = sys.argv[1]
target_dir = os.path.join('json')

if not os.path.exists(target_dir):
    os.makedirs(target_dir)


def dumps(file_path, obj):
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(json.dumps(obj, separators=(
            ',', ':'), ensure_ascii=False, indent=4))


def parse_poem(poem_path, word_set):
    with open(poem_path, 'r', encoding='utf-8')as file:
        lines = list(map(lambda s: s.strip(), file.readlines()))
        title = lines[0][6:]
        date = lines[1][5:]
    poem = {}
    poem['title'] = title
    poem['date'] = date
    content = []
    word_count = 0
    for line in lines[3:]:
        line = line.strip()
        content.append(line)
        word_count += len(line)
        for word in line:
            if word != ' ':
                word_set.add(word)
    poem['content'] = '\n'.join(content)
    return (poem, word_count)


def to_pinyin(s):
    return ''.join(chain.from_iterable(pinyin(s['title'], style=Style.TONE3)))


def parse_poet(dir_name, root):
    split = dir_name.rindex('_')
    poet = {'n': dir_name[:split],
            'p': dir_name[split + 1:], 'c': 0, 'w': 0, 'dw': 0}
    poet_dir = os.path.join(target_dir, poet['n'])
    if not os.path.exists(poet_dir):
        os.makedirs(poet_dir)
    word_set = set()
    poem_list = []
    for root, _, fs in os.walk(os.path.join(root, dir_name)):
        for f in fs:
            if not f.endswith('.pt'):
                continue
            (poem, word_count) = parse_poem(
                os.path.join(root, f), word_set)
            poem_list.append(poem)
            poet['c'] += 1
            poet['w'] += word_count

    poem_list = sorted(poem_list, key=to_pinyin)

    page_num = 0
    page_size = 20

    while page_num * page_size < len(poem_list):
        start = page_num * page_size
        end = (page_num + 1) * page_size
        page_num += 1
        page_content = poem_list[start:end]
        file_path = '{}/{}.json'.format(poet_dir, page_num)
        dumps(file_path, page_content)

    poet['dw'] = len(word_set)
    dumps(os.path.join(poet_dir, 'meta.json'), {"p": page_num, "t": len(poem_list)})
    return poet


if not os.path.exists(target_dir):
    os.makedirs(target_dir)

# Delete previous data
for f in os.listdir(target_dir):
    file_path = os.path.join(target_dir, f)
    if os.path.isfile(file_path):
        os.remove(file_path)
    else:
        shutil.rmtree(file_path, ignore_errors=True)

poet_list = []

for root, ds, _ in os.walk(origin_dir):
    for d in ds:
        poet = parse_poet(d, root)
        if poet:
            poet_list.append(poet)

poet_list = sorted(poet_list, key=lambda poet: poet['p'])

poet_group = dict()
for p in poet_list:
    l = p['p'][0]
    key = l if l >= 'a' and l <= 'z' else '#'
    if key not in poet_group:
        poet_group[key] = []
    poet_group[key].append(p)
for k in poet_group:
    path = os.path.join(target_dir, '__poet_{}.json'.format(k))
    dumps(path, poet_group[k])

# dumps(os.path.join(target_dir, 'list.json'), poet_list)

author_count = len(poet_list)
poem_count = sum(map(lambda p: p['c'], poet_list))
word_count = sum(map(lambda p: p['w'], poet_list))

now_ts = int(time.time() * 1000)
dumps(os.path.join(target_dir, 'meta.json'), {
      'ac': author_count, 'pc': poem_count, 'wc': word_count, 'ts': now_ts})
