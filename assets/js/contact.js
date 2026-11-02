var copyStatus = document.getElementById('copy-status');
function copied(b) {
  b.innerHTML = '<span class="tick" aria-hidden="true"></span>Copied';
  copyStatus.textContent = 'Email copied';
  setTimeout(function () { b.textContent = 'Copy'; copyStatus.textContent = ''; }, 1500);
}
document.querySelectorAll('[data-copy]').forEach(function (b) {
  b.addEventListener('click', function () {
    try {
      navigator.clipboard.writeText(b.dataset.copy).then(function () { copied(b); }, function () { fallback(b); });
    } catch (e) { fallback(b); }
  });
});
function fallback(b) {
  var range = document.createRange();
  range.selectNodeContents(b.previousElementSibling);
  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  if (document.execCommand('copy')) copied(b);
}
