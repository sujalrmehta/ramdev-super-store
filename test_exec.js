const fs = require('fs');
const vm = require('vm');
const sandbox = { 
  window: { addEventListener: () => {} }, 
  document: { getElementById: () => ({ addEventListener: () => {}, querySelectorAll: () => [] }), querySelectorAll: () => [], querySelector: () => ({ offsetTop: 0 }) }, 
  console: console, 
  localStorage: { getItem: () => null, setItem: () => {} }, 
  fetch: () => Promise.resolve(), 
  alert: () => {}, 
  navigator: {} 
};
vm.createContext(sandbox);
try {
  const files = ['public/js/api.js', 'public/js/cart.js', 'public/js/shop.js', 'public/js/admin.js', 'public/js/app.js'];
  for (const file of files) {
    const code = fs.readFileSync(file, 'utf8');
    vm.runInContext(code, sandbox, { filename: file });
    console.log('Loaded ' + file);
  }
} catch (e) {
  console.error('ERROR:', e.message);
  console.error(e.stack);
}
