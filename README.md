# frontend
git clone https://github.com/lfunny/frontend.git -b v5.0 --recursive ./  
git submodule update --init --recursive api classifier parser predict pysvm  
composer install -d api --no-dev  
pip install -r requirements.txt  
yarn install --production  
