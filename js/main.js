    var config = {
    apiKey: "AIzaSyBEDBMlFSszVxY_jlHWdKxIAQW5J07JYSA",
    authDomain: "dazzling-inferno-6227.firebaseapp.com",
    databaseURL: "https://dazzling-inferno-6227.firebaseio.com",
    storageBucket: "dazzling-inferno-6227.appspot.com",
  };
  firebase.initializeApp(config);
    
ImageDealer.REF = firebase;
var currentUser = {displayName: "", uid: "", photoURL: ""};
var uploadModal = new UploadModal($('#upload-modal'));
var viewModal = new ViewModal($("#view-modal"));

//new Firebase("https://dazzling-inferno-6227.firebaseio.com/items");
var items = firebase.database().ref("items");

/*
    分為三種使用情形：
    1. 初次登入，改變成登入狀態
    2. 已為登入狀態，reload 網站照樣顯示登入狀態
    3. 未登入狀態

    登入/當初狀態顯示可使用下方 logginOption function
*/

var viewModal = new ViewModal($('#view-modal'));
var uploadModal = new UploadModal($('#upload-modal'));
var currentItem;


$("#signin").click(function () {
  var fbProvider = new firebase.auth.FacebookAuthProvider();
  // 登入後的頁面行為
  $("#upload").css("display","block");
  $("#signin").css("display","none");
  $("#signout").css("display","block");
  firebase.database().ref("items").once("value",reProduceAll);

  firebase.auth().signInWithPopup(fbProvider).then(function(result){
    currentUser.displayName = result.user.displayName;
    currentUser.uid = result.user.uid;
    currentUser.photoURL = result.user.photoURL;

    var userData = firebase.database().ref("users/" + currentUser.uid);
  }).catch(function(error){
    var errorCode = error.code;
    var errorMessa = error.message;
    console.log(errorCode, errorMessa);
  })
})

$("#signout").click(function () {
    // 登出後的頁面行為
    firebase.auth().signOut().then(function(){
      currentUser.displayName = "";
      currentUser.uid = "";
      currentUser.photoURL = "";

      $("#upload").css("display","none");
      $("#signin").css("display","block");
      $("#signout").css("display","none");
    }, function(error){
      console.log(error.code);
    })
})

//監測登出&登入
firebase.auth().onAuthStateChanged(function(user){
  if(user){
    $("#upload").css("display","block");
    $("#signin").css("display","none");
    $("#signout").css("display","block");
    currentUser.displayName = user.displayName;
    currentUser.uid = user.uid;
    currentUser.photoURL = user.photoURL;
    firebase.database().ref("items").once("value",reProduceAll);
  }else{
    $("#upload").css("display","none");
    $("#signin").css("display","block");
    $("#signout").css("display","none");
  }
})



var nowItem = "";

$("#submitData").click(function() {
    var dataArr = $("#item-info").serializeArray();
    var picFile = $("#picData")[0].files[0];

    if (dataArr[0].value != null && dataArr[1].value != null && dataArr[2].value != null && picFile) {
      firebase.database().ref("items").push({
            title: dataArr[0].value, 
            price: parseInt(dataArr[1].value), 
            descrip: dataArr[2].value, 
            seller: currentUser.uid,
            userTime: new Date($.now()).toLocaleString()});

    //check if it is picture(not yet)
      uploadModal.submitPic(currentUser.uid);
        
      items.once("value",reProduceAll);    
      $("#upload-modal").modal('hide');
    }else{
      alert("請填完喔!!!");
    }
});


$("#editData").click(function(){
    // 編輯商品資訊
    var dataArr = $("#item-info").serializeArray();
    var picFile = $("#picData")[0].files[0];
    uploadModal.itemKey = nowItem;
    
    if (dataArr[0].value != null && dataArr[1].value != null && dataArr[2].value != null) {
      firebase.database().ref("items/" + nowItem).update({
            title: dataArr[0].value, 
            price: parseInt(dataArr[1].value), 
            descrip: dataArr[2].value, 
            seller: currentUser.uid,
      });

      if(picFile){
        uploadModal.submitPic(currentUser.uid);
      }

      items.once("value",reProduceAll);
      $("#upload-modal").modal('hide');
    }

})


$("#removeData").click(function removeItems() {
    uploadModal.itemKey = nowItem;
    firebase.database().ref("items/" + nowItem).remove();
    items.once("value",reProduceAll);
    $("#upload-modal").modal('hide');
})


/*
    商品按鈕在dropdown-menu中
    三種商品篩選方式：
    1. 顯示所有商品
    2. 顯示價格高於 NT$10000 的商品
    3. 顯示價格低於 NT$9999 的商品
*/
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


function reProduceAll(allItems) {
  var allData = allItems.val();
  $("#items").empty();
  for (var itemData in allData) {
    //console.log("readI: " + itemData);
    var itemView = createItems(allData[itemData], itemData);
    $("#items").append(itemView);
   }
}


// 每點開一次就註冊一次
function produceSingleItem(sinItemData){
  /*
    抓取 sinItemData 節點上的資料。
    若你的sinItemData資料欄位中並沒有使用者名稱，請再到user節點存取使用者名稱
    資料齊全後塞進item中，創建 Item 物件，並顯示到頁面上。
  */

  firebase.database().ref().once("",function () {
    $("#items").append();

      /*
        用 ViewModal 填入這筆 item 的資料
        呼叫 ViewModal callImage打開圖片
        創建一個 MessageBox 物件，將 Message 的結構顯示上 #message 裡。
      */


      $("#message").append();

      /*
        判斷使用者是否有登入，如果有登入就讓 #message 容器顯示輸入框。
        在 MessageBox 上面註冊事件，當 submit 時將資料上傳。
      */
      if (currentUser) {
        $("#message").append(messBox.inputBox);

        messBox.inputBox.keypress(function (e) {
          if (e.which == 13) {
            e.preventDefault();

            /*
            取得input的內容 $(this).find("#dialog").val();
            清空input的內容 $(this).find("#dialog").val("");
            */
          }
        });
      }

    /*
    從資料庫中抓出message資料，並將資料填入MessageBox
    */
      /*firebase.database().ref().orderBy.("",function(data) {

      });*/
    });

    /*
    如果使用者有登入，替 editBtn 監聽事件，當使用者點選編輯按鈕時，將資料顯示上 uploadModal。
    */

  //})
}


function generateDialog(diaData, messageBox) {


}


//------------------------------------------------------------------------
function getItemByURL(suburl) {
  return new Firebase("https://dazzling-inferno-6227.firebaseio.com/"+suburl);
}


function reArrangeItems(snapshot, former) {
  var newDa = snapshot.val();
  $("#items").append(createItems(newDa, newDa.key));
}


function createItems(itemData,key) {
  var picPart = createPic(itemData.imgD, key);
  var wordPart = createIntro(itemData.title, itemData.price, currentUser.displayName);
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


// show the thumbnail (not yet)
function picShow(event) {
   var file = event.target.files[0];
    var picTrans = new FileReader();
   picTrans.onload = (function (imge) {return function (e) {
     imge.src = e.target.result;
     console.log(e.target.result);
   }})(file);
   console.log(file);
   picTrans.readAsDataURL(file);
   //console.log(picTrans.readAsDataURL(file).result);
}
//--------------------------------------------------------------------
//firebase.database().ref("items").once("value",reProduceAll);
//---------------------------------------------------------------------
/*$("#submitData").click(function (event) {
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
});*/

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
