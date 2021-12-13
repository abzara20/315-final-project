var MODEL = (function () {
  let _pgChange = function (pgID, callback) {
    $.get(`pages/${pgID}/${pgID}.html`, function (data) {
      $("#app").html(data);
      if (callback) {
        callback(pgID);
      }
    });
  };

  return {
    pgChange: _pgChange,
  };
})();
