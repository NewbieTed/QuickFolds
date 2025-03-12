# note: can also run this commands in your terminal
cd ..

docker stop $(docker ps -q)
pkill -f "mvn"

cd setup
