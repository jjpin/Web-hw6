// sweltering-inferno-2041
var items = new Firebase("https://dazzling-inferno-6227.firebaseio.com/items")
var users = getItemByURL("users");
var currViewer = "";
var nowItem = "";

function saveItems(title, price, descrip, pic) {
  /*var itemID = items.push({"title":title, "price":price, "descrip":descrip, "imgD":pic, "userTime": new Date($.now()).toLocaleString(), "seller": users.getAuth().uid});
  var sellItems = users.child(users.getAuth().uid + "/sellItems");
  var tmpD = {};
  var itemIDStr = itemID.key().split("/");
  tmpD[itemIDStr[itemIDStr.length-1]] = true;
  sellItems.update(tmpD);*/
  
  items.push({title:title,price:price,descrip:descrip,imgD:pic,userTime:new Date($.now()).toLocaleString()});
}

function viewAllItems() {
  items.once("value",readItems);
}

function showAllItems() {
  items.on("value",readItems);
}

function updateItem(title, price, descrip, pic) {
  items.update({title:title,price:price,descrip:descrip,imgD:pic,userTime:new Date($.now()).toLocaleString()});
}

function selectExpItems(e) {
  items.orderByChild("price").startAt(10000).on("value",readItems);
}

function selectCheapItems() {
  items.orderByChild("price").endAt(9999).on("value",readItems);
}

function removeItems() {
  items.remove();
}

function authenticate() {
  users.authWithOAuthPopup("facebook",function (error, authData) {
    if (error) {
      alert("fail to login");
    }else{

      // 更新資料，authData.uid 存成ID，
           //authData.facebook.displayName 存成 name
           // 有存過就不更新

      hasLogin();
    }
  })
}

function getItemByURL(suburl) {
  return new Firebase("https://<your_id>.firebaseio.com/"+suburl);
}

function readItems(snapshot) {
  var allData = snapshot.val();
  $("#items").empty();
  for (var itemData in allData) {
    //console.log("readI: " + itemData);
    var itemView = createItems(allData[itemData], itemData);
    $("#items").append(itemView);
   }
}
//----------------------------------------------------------------------------
function reArrangeItems(snapshot, former) {
  var newDa = snapshot.val();
  $("#items").append(createItems(newDa, newDa.key));
}
function checkAu() {
  if (users.getAuth()) {
    users.orderByKey().equalTo(users.getAuth().uid).once("value",function (snapshot) {
      if (snapshot.val()) {
        hasLogin();
      }
    })
  }
}

function hasLogin() {
  $("#upload").css("display","block");
  $("#signin").css("display","none");
  $("#signout").css("display","block");
  showAllItems();
}

function createItems(itemData,key) {
  var picPart = createPic(itemData.imgD, key, itemData.seller);
  var wordPart = createIntro(itemData.title, itemData.price, itemData.seller);
  var itemView = $("<div>",{
    class: "sale-item",
  }).append(picPart).append(wordPart);
  return itemView;
}
function picBack(imgD) {
  //var bb = new Blob([imgD],{type:'image/jpeg'})
  //var shortURL = URL.createObjectURL(bb);
  //console.log(shortURL);
  return $("<div>",{
    class: "pic",
  }).css("background-image", 'url('+ imgD + ')');
}

function updateModal(e, upData) {
  $("#upload-modal").modal('show');
  $("input:nth-of-type(1)").val(upData.title);
  $("input:nth-of-type(2)").val(upData.price);
  $("textarea").val(upData.descrip);
  $("#ModalLabel").text("Edit Item");
  $("#submitData").css("display","none");
  $("#editData").css("display","inline-block");
  $("#removeData").css("display","inline-block");
}

function createPic(imgD, key, authorUID) {
  var liscene = users.getAuth()?users.getAuth().uid:"none";
  if (authorUID === liscene) {
    var picDom = picBack(imgD).append($("<div>",{class: "white-mask"}).append(
      $("<div>",{class: "option"}).append(
        $("<h6>", {text: "view"})
      ).append($("<h6>", {text: "edit", on:{
            click: function (e) {
              nowItem = key;
              var data = getItemByURL("items/"+ key);
              data.once("value", function (snapshot) {
                updateModal(e, snapshot.val());
              })
            }
          }
    }))
    ));
  }else {
    var picDom = picBack(imgD).append($("<div>",{class: "white-mask"}).append(
      $("<div>",{class: "option"}).append(
        $("<h6>",{text: "view"})
      )
    ));
  }

  return picDom;
}
function createIntro(title, price, author) {
  // async data flow write this way
  var authName = "anonymouse";
  var authDom = $("<a>",{href: "#", text: authName});
  var wordDom = $("<div>", {class: "word"}).append(
    $("<div>", {class: "name-price"}).append(
      $("<p>",{text: title})
    ).append(
      $("<p>",{text: '$' + price})
    )
  ).append(
    $("<div>", {class: "seller"}).append(
      authDom
    )
  );
  users.child(author+ "/name").once("value", function (snapshot) {
    authName = snapshot.val()?snapshot.val():"anonymous";
    authDom.text(authName);
  });
  return wordDom;
}
// show the thumbnail (not yet)
function picShow(event) {
//   var file = event.target.files[0];
//   var picTrans = new FileReader();
//   picTrans.onload = (function (imge) {return function (e) {
//     imge.src = e.target.result;
//     console.log(e.target.result);
//   }})(file);
//   //console.log(file);
//   picTrans.readAsDataURL(file);
//   //console.log(picTrans.readAsDataURL(file).result);
}
//--------------------------------------------------------------------
showAllItems();
checkAu();
//---------------------------------------------------------------------
$("#submitData").click(function (event) {
  var dataArr = $("#item-info").serializeArray();
  var picFile = $("#picData")[0].files[0];
  var picTrans = new FileReader();
  if (dataArr[0].value != null && dataArr[1].value != null && dataArr[2].value != null && picFile ) {
    //check if it is picture(not yet)

    picTrans.readAsDataURL(picFile);
    picTrans.onloadend = (function (imge) {return function (e) {
        imge.src = e.target.result;
        saveItems(dataArr[0].value, dataArr[1].value, dataArr[2].value, e.target.result);
    }})(picFile);
    $("#upload-modal").modal('hide');
  }

});

$("#editData").click(function (event) {
  var dataArr = $("#item-info").serializeArray();
  var picFile = $("#picData")[0].files[0];
  var picTrans = new FileReader();
  if (dataArr[0].value != null && dataArr[1].value != null && dataArr[2].value != null && picFile ) {
    //check if it is picture(not yet)

    picTrans.readAsDataURL(picFile);
    picTrans.onloadend = (function (imge) {return function (e) {
        imge.src = e.target.result;
        updateItem(dataArr[0].value, parseInt(dataArr[1].value), dataArr[2].value, e.target.result);
    }})(picFile);
    $("#upload-modal").modal('hide');
  }
});

$("#signin").click(function () {
  authenticate();
});

$("#signout").click(function () {
  users.unauth();
  $("#upload").css("display","none");
  $("#signin").css("display","block");
  $("#signout").css("display","none");
  showAllItems();
})

$("#removeData").click(function () {
  removeItems();
  $("#upload-modal").modal('hide');
});

$("#price-select span:nth-of-type(1)").click(function (event) {
  showAllItems();
});

$("#price-select span:nth-of-type(2)").click(function (event) {
  selectExpItems(event);
});

$("#price-select span:nth-of-type(3)").click(function (event) {
  selectCheapItems();
});

$("#upload-modal").on('hidden.bs.modal', function (e) {
  $("#item-info :input").val("");
  $("#picData").val("");
  $("#ModalLabel").text("New Item");
  $("#editData").css("display","none");
  $("#removeData").css("display","none");
  $("#submitData").css("display","inline-block");
});

$("#picData").change(function (e) {
  picShow(e);
});
