# frontend
git clone https://github.com/lfunny/frontend.git -b v3.1 --recursive ./  
git submodule update --init --recursive api classifier parser predict pysvm  
pip install -r classifier/requirements.txt  
pip install -r parser/requirements.txt  
composer install -d api --no-dev  
yarn install --production  
