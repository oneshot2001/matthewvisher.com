// Loads before anything else on the page, so Refused also counts what the header blocks during load.
const refusals = [];
document.addEventListener('securitypolicyviolation', (e) => refusals.push(e));
