//<script src="https://www.gstatic.com/firebasejs/live/3.0/firebase.js"></script>
  // Initialize Firebase
  /*var config = {
    apiKey: "AIzaSyAyGtbdo8nkQFlBse7j-eUFotlzPu6B8ts",
    authDomain: "web-hw6-25ffb.firebaseapp.com",
    databaseURL: "https://web-hw6-25ffb.firebaseio.com",
    storageBucket: "web-hw6-25ffb.appspot.com",
  };
  firebase.initializeApp(config);*/

  var config = {
    apiKey: "AIzaSyBEDBMlFSszVxY_jlHWdKxIAQW5J07JYSA",
    authDomain: "dazzling-inferno-6227.firebaseapp.com",
    databaseURL: "https://dazzling-inferno-6227.firebaseio.com",
    storageBucket: "dazzling-inferno-6227.appspot.com",
  };
  firebase.initializeApp(config);
    
ImageDealer.REF = firebase;
var currentUser ;


new Firebase("https://dazzling-inferno-6227.firebaseio.com/items");
firebase.database().ref("items");

/*
    分為三種使用情形：
    1. 初次登入，改變成登入狀態
    2. 已為登入狀態，reload 網站照樣顯示登入狀態
    3. 未登入狀態

    登入/當初狀態顯示可使用下方 logginOption function
*/

var fbProvider = new firebase.auth.FacebookAuthProvider();

$("#signin").click(function () {
  // 登入後的頁面行為
  $("#upload").css("display","block");
  $("#signin").css("display","none");
  $("#signout").css("display","block");
  firebase.database().ref("items").once("value",reProduceAll);

  firebase.auth().signInWithPopup(fbProvider).then(function(result){
    currentUser.displayName = result.user.displayName;
    currentUser.uid = result.user.uid;
    currentUser.photoURL = result.user.photoURL;
  }).catch(function(error){
    var errorCode = error.code;
    var errorMessa = error.message;
    console.log(errorCode, errorMessa);
  })
})

$("#signout").click(function () {
    // 登出後的頁面行為
    firebase.auth().signOut().then(function(){
    }, function(error){
      console.log(error.code);
    })
})

//監測登出&登入
/*firebase.auth().onAuthStateChanged(function(user){
  if(user.getAuth()){
    users.orderByKey().equalTo(users.getAuth().uid).once("value",function (snapshot)
  }else{
    $("#upload").css("display","none");
    $("#signin").css("display","block");
    $("#signout").css("display","none");
  })
})*/



var nowItem = "";

$("#submitData").click(function saveItems(title, price, descrip, pic) {
    // 上傳新商品
    firebase.database().ref("items").push({title:title,price:price,descrip:descrip,imgD:pic,userTime:new Date($.now()).toLocaleString()});
});

$("#editData").click(function updateItem(title, price, descrip, pic){
    // 編輯商品資訊
    //更新資料
    var data = {title, price, descrip, pic};
    data["/messages/" + uid + "/message"] = word;
    data["/users/" + uid + "/record"] = word;
    firebase.database().ref().update(messa);
})

$("#removeData").click(function removeItems() {
    //刪除商品
    firebase.database().ref("items").remove();
})


$('#all').click(function showAllItems(){
  firebase.database().ref("items").once("value",reProduceAll);
})

$('#10000up').click(function showExpItems(){
  firebase.database().ref("items").orderByChild("price").startAt(10000).once("value",reProduceAll);
})

$('#9999down').click(function showCheapItems(){
  firebase.database().ref("items").orderByChild("price").endAt(9999).once("value",reProduceAll);
})


function logginOption(isLoggin) {
  if (isLoggin) {
    $("#upload").css("display","block");
    $("#signin").css("display","none");
    $("#signout").css("display","block");
  }else {
    $("#upload").css("display","none");
    $("#signin").css("display","block");
    $("#signout").css("display","none");
  }
}



function readItems(snapshot) {
var allData = snapshot.val();
$("#items").empty();
for(var itemData in allData)
{
  var itemView = createItems(allData[itemData],itemData);
  $("#items").append(itemView);
}
}
//------------------------------------------------------------------------
function getItemByURL(suburl) {
  return new Firebase("https://<YOUR ID>.firebaseio.com/"+suburl);
}


function reArrangeItems(snapshot, former) {
  var newDa = snapshot.val();
  $("#items").append(createItems(newDa, newDa.key));
}


function createItems(itemData,key) {
  var picPart = createPic(itemData.imgD, key);
  var wordPart = createIntro(itemData.title, itemData.price, "anonymous");
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


function createPic(imgD, key) {
  var picNode = picBack(imgD).append($("<div>",{class: "white-mask"}).append(
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
  return picNode;
}


function createIntro(title, price, author) {
  return $("<div>", {class: "word"}).append(
    $("<div>", {class: "name-price"}).append(
      $("<p>",{text: title})
    ).append(
      $("<p>",{text: '$' + price})
    )
  ).append(
    $("<div>", {class: "seller"}).append(
      $("<a>",{href: "#", text: author})
    )
  )
}


function reProduceAll(allItems) {
  var allData = allItems.val();
  $("#items").empty();
  for (var itemData in allData) {
    //console.log("readI: " + itemData);
    var itemView = createItems(allData[itemData], itemData);
    $("#items").append(itemView);
   }
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
firebase.database().ref("items").once("value",reProduceAll);
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

$("#removeData").click(function () {
  removeItems();
  $("#upload-modal").modal('hide');
});

$("#price-select span:nth-of-type(1)").click(function (event) {
  viewAllItems();
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