const fs = require('fs');
const path = require('path');

const BACKEND_DIR = path.join(__dirname, 'Backend');

// Expected exact casing for files
const fileMappings = {
    // Middleware
    'authmiddleware.js': 'authMiddleware.js',
    'upload.js': 'upload.js',
    // Controllers
    'authcontroller.js': 'authController.js',
    'menucontrollers.js': 'menuController.js',
    'ordercontroller.js': 'orderController.js',
    'reservationController.js': 'reservationController.js',
    'restaurantAuthController.js': 'restaurantAuthController.js',
    'restaurantController.js': 'restaurantController.js',
    'searchController.js': 'searchController.js',
    'uploadController.js': 'uploadController.js',
    // Routes
    'authroutes.js': 'authRoutes.js',
    'menuRoutes.js': 'menuRoutes.js',
    'orderRoutes.js': 'orderRoutes.js',
    'reservationRoutes.js': 'reservationRoutes.js',
    'restaurantAuthRoutes.js': 'restaurantAuthRoutes.js',
    'restaurantDashboardRoutes.js': 'restaurantDashboardRoutes.js',
    'restaurantRoutes.js': 'restaurantRoutes.js',
    'searchRoutes.js': 'searchRoutes.js',
    'userroutes.js': 'userRoutes.js',
    // Models
    'Menu.js': 'Menu.js',
    'Order.js': 'Order.js',
    'Otp.js': 'Otp.js',
    'Reservation.js': 'Reservation.js',
    'Restaurant.js': 'Restaurant.js',
    'user.js': 'User.js',
    // Config
    'cloudinary.js': 'cloudinary.js',
    'db.js': 'db.js',
    'fireBase.js': 'fireBase.js',
    'razorpay.js': 'razorpay.js'
};

function renameFiles() {
    const folders = ['Middleware', 'controllers', 'routes', 'Models', 'config'];
    folders.forEach(folder => {
        const dir = path.join(BACKEND_DIR, folder);
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const lowerFile = file.toLowerCase();
            const expected = Object.values(fileMappings).find(v => v.toLowerCase() === lowerFile);
            if (expected && file !== expected) {
                fs.renameSync(path.join(dir, file), path.join(dir, expected));
                console.log(`Renamed ${file} to ${expected}`);
            }
        });
    });
}

function updateImports() {
    const foldersToSearch = ['Middleware', 'controllers', 'routes', 'Models', 'config'];

    function processFile(filePath) {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;

        Object.keys(fileMappings).forEach(wrongCase => {
            const rightCase = fileMappings[wrongCase];
            // Regex to match imports ignoring case
            const regex = new RegExp(`(import.*?from.*?["'].*?)${wrongCase}(["'].*?)`, 'gi');
            content = content.replace(regex, (match, prefix, suffix) => {
                changed = true;
                return `${prefix}${rightCase}${suffix}`;
            });
            // Handle require
            const requireRegex = new RegExp(`(require\\(["'].*?)${wrongCase}(["']\\))`, 'gi');
            content = content.replace(requireRegex, (match, prefix, suffix) => {
                changed = true;
                return `${prefix}${rightCase}${suffix}`;
            });
        });

        if (changed) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated imports in ${filePath}`);
        }
    }

    // Iterate logic
    const processFolder = (folder) => {
        const dir = path.join(BACKEND_DIR, folder);
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            if (file.endsWith('.js')) {
                processFile(path.join(dir, file));
            }
        });
    }

    foldersToSearch.forEach(processFolder);
    processFile(path.join(BACKEND_DIR, 'server.js'));
}

renameFiles();
updateImports();
console.log('Fixed file casing and imports.');
