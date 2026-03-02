const fs = require('fs');
const path = require('path');

const FRONTEND_SRC = path.join(__dirname, 'frontend', 'src');

const exactFiles = {
    // Pages
    'auth.jsx': 'Auth.jsx',
    'dishdetails.jsx': 'DishDetails.jsx',
    'home.jsx': 'Home.jsx',
    'login.jsx': 'Login.jsx',
    'otplogin.jsx': 'OtpLogin.jsx',
    'profile.jsx': 'Profile.jsx',
    'register.jsx': 'Register.jsx',
    'restaurantaddmenu.jsx': 'RestaurantAddMenu.jsx',
    'restaurantdashboard.jsx': 'RestaurantDashboard.jsx',
    'restaurantdetails.jsx': 'RestaurantDetails.jsx',
    'restaurantlogin.jsx': 'RestaurantLogin.jsx',
    'restaurantpage.jsx': 'RestaurantPage.jsx',
    // Components
    'authlayout.jsx': 'AuthLayout.jsx',
    'menucard.jsx': 'MenuCard.jsx',
    'restaurantprotected.jsx': 'RestaurantProtected.jsx',
    // Styles
    'auth.css': 'auth.css',
    'home.css': 'home.css',
    'profile.css': 'profile.css',
    'restaurant.css': 'restaurant.css',
    'restaurantdashboard.css': 'restaurantDashboard.css',
    'restaurantdetails.css': 'restaurantDetails.css'
};

function fixImportsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Regex matches imports like: import Something from './SomeFile.jsx';
    // and import './styles/SomeStyle.css';
    const importRegex = /import\s+.*?['"](.*?)['"]/g;
    const matches = [...content.matchAll(importRegex)];

    matches.forEach(match => {
        const importPath = match[1];
        const pathParts = importPath.split('/');
        const fileName = pathParts[pathParts.length - 1];

        if (fileName && fileName.includes('.')) {
            const lowerFileName = fileName.toLowerCase();
            if (exactFiles[lowerFileName] && exactFiles[lowerFileName] !== fileName) {
                const correctFileName = exactFiles[lowerFileName];
                const correctImportPath = importPath.slice(0, -fileName.length) + correctFileName;

                // Replace in content
                content = content.replace(new RegExp(`['"]${importPath}['"]`, 'g'), `"${correctImportPath}"`);
                changed = true;
                console.log(`Fixed import in ${path.basename(filePath)}: ${importPath} -> ${correctImportPath}`);
            }
        }
    });

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            fixImportsInFile(fullPath);
        }
    });
}

scanDir(FRONTEND_SRC);
console.log('Finished fixing frontend imports.');
