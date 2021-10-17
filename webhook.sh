cd ~/workspace/poetry
git pull
echo poetry pulled
python3.9 update_count.py
git add README.md
git commit -m "Update count by bot"
cd tool
mvn clean package
cd ../
sh poem.sh clean
python3.9 script/clean/trash.py data
git add data
git commit -m "Simplify by bot"
git push
echo updated the count of data
cd ~/workspace/poetry-page
git pull
echo poetry-page pulled
python3.9 build.py ~/workspace/poetry/data
echo generated
git add .
git commit -m "Update by CI bot"
git push
echo finished
