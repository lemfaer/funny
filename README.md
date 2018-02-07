# frontend
git clone https://github.com/lfunny/frontend.git -b v3.1 --recursive ./  
git submodule update --init --recursive api classifier parser  
npm install --production  
cd api && composer install --no-dev  
