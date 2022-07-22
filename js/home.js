function n2d(num) {
    return num < 10 ? '0' + num : num
}
function setTotal(totalCount, poetCount, wordCount, timestamp) {
    totalCount = totalCount || '-'
    poetCount = poetCount || '-'
    wordCount = wordCount || '-'
    tsStr = '-'
    if (timestamp) {
        const time = new Date(timestamp)
        const year = time.getFullYear()
        const month = time.getMonth() + 1
        const date = time.getDate()
        const hour = time.getHours()
        const minute = time.getMinutes()
        const seconds = time.getSeconds()
        tsStr = `${year}-${n2d(month)}-${n2d(date)} ${n2d(hour)}:${n2d(minute)}:${n2d(seconds)} 更新`
    }
    document.getElementById(
        'total-title'
    ).innerText = `${totalCount} 位 / ${poetCount} 首 / ${wordCount} 字 / ${tsStr}`
}

setTotal()

// Update count of poet
getJson('/meta.json', (data) => setTotal(data.ac, data.pc, data.wc, data.ts))

function renderLabel(key, label) {
    const a = document.createElement('a')
    const realLabel = label || key
    a.innerText = realLabel
    a.setAttribute("label-key", key)
    a.id = `label-${key}`
    a.classList.add("letter-label")
    a.onclick = () => clickTab(key)
    return a
}

function init() {
    // label
    const charCodeOfLowerA = 'a'.charCodeAt(0)
    const charCodeOfUpperA = 'A'.charCodeAt(0)
    const labelTd = document.createElement('td')
    labelTd.classList.add('card-label')

    for (let i = 0; i < 26; i++) {
        const key = String.fromCharCode(charCodeOfLowerA + i)
        const label = String.fromCharCode(charCodeOfUpperA + i)
        labelTd.append(renderLabel(key, label))
    }
    labelTd.append(renderLabel('#'))

    const labelTr = document.createElement('tr')
    labelTr.append(labelTd)
    const table = document.getElementById('table-container')
    table.append(labelTr)

    // content
    const contentTr = document.createElement('tr')
    const contentTd = document.createElement('td')
    contentTd.id = "content-td"
    contentTr.append(contentTd)
    table.append(contentTr)
}

function clickTab(key) {
    Array.from(document.getElementsByClassName("letter-label")).forEach(ele => {
        ele.classList.remove("active")
        const clzList = ele.classList
        if (ele.id === `label-${key}`) {
            clzList.add("active")
        } else {
            clzList.remove("active")
        }
    })

    const contentTd = document.getElementById('content-td')
    contentTd.childNodes.forEach(c => c.remove())
    contentTd.innerText = "数据查询中..."
    getJson(`/__poet_${encodeURIComponent(key)}.json`, (items) => {
        contentTd.innerText = ''
        if (!items || !items.length) {
            contentTd.innerText = '无数据'
        } else {
            items.forEach(item => {
                const link = document.createElement('a')
                link.classList.add('card-link')
                const name = item.n
                link.innerText = name
                link.href = `/poet.html?name=${name}`
                contentTd.append(link)
            })
        }
    }, () => {
        contentTd.innerText = '无数据'
    })
}

// Render the card
document.body.onload = () => {
    init()
    clickTab("a")
}
