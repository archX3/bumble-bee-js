module.exports = function(number, index) {
  return [
    ['μόλις τώρα', 'σε λίγο'],
    ['%s δευτερόλεπτα πριν', 'σε %s δευτερόλεπτα'],
    ['1 λεπτό πριν', 'σε 1 λεπτό'],
    ['%s λεπτά πριν', 'σε %s λεπτά'],
    ['1 ώρα πριν', 'σε 1 ώρα'],
    ['%s ώρες πριν', 'σε %s ώρες'],
    ['1 μέρα πριν', 'σε 1 μέρα'],
    ['%s μέρες πριν', 'σε %s μέρες'],
    ['1 εβδομάδα πριν', 'σε 1 εβδομάδα'],
    ['%s εβδομάδες πριν', 'σε %s εβδομάδες'],
    ['1 μήνα πριν', 'σε 1 μήνα'],
    ['%s μήνες πριν', 'σε %s μήνες'],
    ['1 χρόνο πριν', 'σε 1 χρόνο'],
    ['%s χρόνια πριν', 'σε %s χρόνια']
  ][index];
}
