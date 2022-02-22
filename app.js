//###### global data #######
const config = {
  top: document.querySelector("#top"),
  main: document.querySelector("#main"),
  user: null,
};

// ##### classes ########
class User {
  constructor(name, age, days, money, items, hamburger) {
    this.name = name;
    this.age = age;
    this.days = days;
    this.money = money;
    this.items = items;
    this.hamburger = hamburger;
  }
}

class Hamburger {
  constructor(currentNumber, amountPerClick) {
    this.currentNumber = currentNumber;
    this.amountPerClick = amountPerClick;
  }
}

class Items {
  constructor(
    name,
    type,
    currentAmount,
    maxAmount,
    perMoney,
    perRate,
    price,
    url
  ) {
    this.name = name;
    this.type = type;
    this.currentAmount = currentAmount;
    this.maxAmount = maxAmount;
    this.perMoney = perMoney;
    this.perRate = perRate;
    this.price = price;
    this.url = url;
  }
}

class Top {
  constructor() {
    appendTemplate("topTemplate");

    const newGameBtn = config.top.querySelectorAll("button")[0];
    const loginBtn = config.top.querySelectorAll("button")[1];

    newGameBtn.addEventListener("click", () => {
      const userName = this.getUserNmae();
      if (!userName) {
        alert(errorMessage.requiredUserName);
        return;
      }
      this.createUserInfo(userName);
      removePage(config.top);
      new Main(false);
    });

    loginBtn.addEventListener("click", () => {
      const userName = this.getUserNmae();
      if (!userName) {
        alert(errorMessage.requiredUserName);
        return;
      }
      const saveData = localStorage.getItem(userName);
      config.user = JSON.parse(saveData);
      if (!saveData) {
        alert("データが存在しません");
        return;
      }
      removePage(config.top);
      new Main(true);
    });
  }

  /**
   * 入力値のユーザ名を取得する
   * @returns ユーザ名
   */
  getUserNmae() {
    const userName = config.top.querySelector("input").value;
    return userName;
  }

  /**
   * ユーザ情報を生成する
   * @param {*} userName
   */
  createUserInfo(userName) {
    config.user = new User(
      userName,
      init.age,
      init.days,
      init.money,
      createItemData(),
      new Hamburger(0, 25)
    );
  }
}

class Main {
  constructor(isLogin) {
    this.isLogin = isLogin;
    appendTemplate("mainTemplate");

    this.humbergerInfo = config.main.querySelector("#hamburgerInfo");
    this.userInfo = config.main.querySelector("#userInfo");
    this.itemInfo = config.main.querySelector("#itemInfo");
    this.itemDetail = config.main.querySelector("#itemDetail");

    const humbergerPic = config.main
      .querySelector("#humbergerPic")
      .querySelector("img");

    humbergerPic.addEventListener("click", () => {
      config.user.hamburger.currentNumber += 1;
      config.user.money += config.user.hamburger.amountPerClick;
      this.createHumbergerInfo();
      this.createUserInfo();
    });

    this.createHumbergerInfo();
    this.createUserInfo();
    this.createItemInfo();
    this.createItemDetail();
    this.id = interval(this.isLogin);

    const reset = config.main.querySelector("#reset");
    reset.addEventListener("click", () => {
      const res = confirm("リセットしますか？");
      if (res) {
        config.user = new User(
          config.user.name,
          init.age,
          init.days,
          init.money,
          createItemData(),
          new Hamburger(0, 25)
        );
        this.createUserInfo();
        this.createHumbergerInfo();
        this.itemInfo.innerHTML = "";
        this.createItemInfo();
        this.createItemDetail();
        clearInterval(this.id);
        this.id = interval(this.isLogin);
        localStorage.removeItem(config.user.name);
        alert("リセットしました。");
      }
    });

    const save = config.main.querySelector("#save");
    save.addEventListener("click", () => {
      localStorage.setItem(config.user.name, JSON.stringify(config.user));
      alert("セーブしました");
    });
  }

  /**
   * ハンバーガ情報部分を生成
   */
  createHumbergerInfo() {
    this.humbergerInfo.innerHTML = `
        <p>${config.user.hamburger.currentNumber} humbergers</p>
        <p id="amountPerClick">one click ¥${config.user.hamburger.amountPerClick}</p>
    `;
  }

  /**
   * ユーザプロフィールを生成
   */
  createUserInfo() {
    this.userInfo.innerHTML = `
        <div class="d-flex justify-content-center">
            <div class="border col-5">
                <p>name: ${config.user.name}</p>
            </div>
            <div class="border col-5">
              <p id="age">age: ${config.user.age} years old</p>
            </div>
        </div>
        <div class="d-flex justify-content-center">
            <div class="border col-5">
                <p id="pastDays">days: ${config.user.days}</p>
            </div>
            <div class="border col-5">
                <p id="money">money: ¥${config.user.money}</p>
            </div>
        </div>
      `;
  }

  /**
   * アイテム情報を生成する
   */
  createItemInfo() {
    let items = config.user.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let perMoney = getPerMoney(item);
      let type = getType(item);

      this.itemInfo.innerHTML += `
        <div class="bg-info p-3 mx-2 mb-1 d-flex align-items-center text-white item" id="item-${i}">
            <div class="d-none d-sm-block p-1 col-sm-3">
                <img src="${item.url}" class="img-fluid">
            </div>
            <div class="col-9">
                <div class="d-flex justify-content-between">
                    <p>${item.name}</p>
                    <p id="currentAmount">${item.currentAmount}</p>
                </div>
                <div class="d-flex justify-content-between">
                    <p>¥${item.price}</p>
                    <p class="text-warning">¥${perMoney} / ${type}</p>
                </div>
            </div>
        </div>
        `;
    }
  }

  /**
   * アイテム詳細を生成する
   */
  createItemDetail() {
    const itemElementList = this.itemInfo.querySelectorAll(".item");
    const items = config.user.items;
    for (let i = 0; i < itemElementList.length; i++) {
      itemElementList[i].addEventListener("click", () => {
        removePage(this.itemInfo);
        addPage(this.itemDetail);
        new ItemDetail(i, items[i], this.itemDetail);
      });
    }
  }
}

class ItemDetail {
  constructor(index, item, hostElement) {
    const itemDetail = config.main.querySelector("#itemDetail");
    const itemInfo = config.main.querySelector("#itemInfo");
    this.createItemDetail(index, item, hostElement);

    const inputEl = hostElement.querySelector("input");
    inputEl.addEventListener("input", () => {
      const total = this.calculateTotalPrice(hostElement, item);
      hostElement.querySelector("#total").textContent = `total: ¥${total}`;
    });

    const buttons = hostElement.querySelectorAll("button");
    const goBackBtn = buttons[0];
    const purchaseBtn = buttons[1];

    goBackBtn.addEventListener("click", () => {
      removePage(itemDetail);
      itemInfo.classList.remove("d-none");
    });

    purchaseBtn.addEventListener("click", () => {
      const total = this.calculateTotalPrice(hostElement, item);
      if (!this.haveEnoughMoney(total)) {
        alert(errorMessage.lackOfMoney);
        return;
      }
      if (this.isOverMaxAmount(inputEl.value, item)) {
        alert(errorMessage.overAmount);
        return;
      }
      this.updateHamburger(item, +inputEl.value);
      this.updateItemInfo(index, +inputEl.value);
      this.updateUserInfo(total);
      removePage(itemDetail);
      itemInfo.classList.remove("d-none");
      alert(`${item.name}を${inputEl.value}個購入しました`);
    });
  }

  /**
   * アイテム詳細ページを生成
   * @param {*} index
   * @param {*} item
   * @param {*} hostElement
   */
  createItemDetail(index, item, hostElement) {
    let perMoney = getPerMoney(item);
    let type = getType(item);
    hostElement.innerHTML = `
        <div class="bg-info p-3 mx-2 mb-1 text-white w100" id="item-${index}">
            <div class="d-flex justify-content-between">
                <div>
                    <h2>${item.name}</h2>
                    <p>Max purchases: ${item.maxAmount}</p>
                    <p>Price: ¥${item.price}</p>
                    <p>Get ¥${perMoney} /${type}</p>
                </div>
                <div class="d-none d-sm-block p-1 col-sm-5">
                    <img src="${item.url}" class="img-fluid">
                </div>
            </div>
            <p class="text-left">How many would you like to buy?</p>
            <div class="input-group col-12">
                <input
                    type="number"
                    class="form-control"
                    min=0
                    value=0
                />
            </div>
            <p class="text-right" id="total">total: ¥0</p>
            <div class="d-flex justify-content-around">
                <button type="button" class="btn btn-primary col-5 text-white">
                    Go Back
                </button>
                <button type="button" class="btn btn-primary col-5 text-white">
                    Purchase
                </button>
            </div>
        </div>
    `;
  }

  /**
   * 合計金額を算出する
   * @param {*} hostElement
   * @param {*} item
   * @returns
   */
  calculateTotalPrice(hostElement, item) {
    const inputEl = hostElement.querySelector("input");
    const value = inputEl.value;
    return +value * item.price;
  }

  /**
   * お金が足りているかのチェック処理
   * @param {*} totalPrice
   * @returns
   */
  haveEnoughMoney(totalPrice) {
    return config.user.money >= totalPrice;
  }

  /**
   * 最大購入数を超えていないかのチェック処理
   * @param {*} value
   * @param {*} item
   * @returns
   */
  isOverMaxAmount(value, item) {
    const userItems = config.user.items;
    for (let userItem of userItems) {
      if (
        userItem.name === item.name &&
        userItem.currentAmount + value > item.maxAmount
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * ハンバーガー情報を更新する
   * @param {*} item
   * @param {*} value
   */
  updateHamburger(item, value) {
    let perMoney = getPerMoney(item) * value;
    if (item.type === "click") {
      config.user.hamburger.amountPerClick += perMoney;
      const hamburger = config.main.querySelector("#hamburgerInfo");
      const amountPerclick = hamburger.querySelector("#amountPerClick");
      amountPerclick.textContent = `one click ¥${config.user.hamburger.amountPerClick}`;
    }
  }

  /**
   * アイテム情報を更新する
   * @param {*} index
   * @param {*} purchaseNumber
   */
  updateItemInfo(index, purchaseNumber) {
    const items = config.user.items;
    items[index].currentAmount += purchaseNumber;
    const itemInfo = config.main.querySelector("#itemInfo");
    const selectedItem = itemInfo.querySelector(`#item-${index}`);
    const currentAmount = selectedItem.querySelector("#currentAmount");
    currentAmount.textContent = items[index].currentAmount;
  }

  /**
   * ユーザ情報を更新する
   * @param {*} totalPrice
   */
  updateUserInfo(totalPrice) {
    const userInfo = config.main.querySelector("#userInfo");
    const money = userInfo.querySelector("#money");
    let userMoney = config.user.money - totalPrice;
    config.user.money = userMoney;
    money.textContent = `money: ¥${config.user.money}`;
  }
}

//######## global functions ########
function appendTemplate(id) {
  const template = document.getElementById(id);
  const clone = template.content.cloneNode(true);
  if (id === templateName.top) {
    config.top.appendChild(clone);
  } else {
    config.main.appendChild(clone);
  }
}

function removePage(element) {
  element.classList.add("d-none");
  element.classList.remove("d-flex");
}

function addPage(element) {
  element.classList.add("d-flex");
  element.classList.remove("d-none");
}

function interval(isLogin) {
  let day = 1;
  if (isLogin) {
    day = config.user.days;
  }
  const userInfo = config.main.querySelector("#userInfo");
  let id = setInterval(() => {
    const pastDays = userInfo.querySelector("#pastDays");

    pastDays.textContent = `days: ${day}`;
    if (day % DAYS_IN_YEAR === 0) {
      config.user.age += 1;
      const age = userInfo.querySelector("#age");
      age.textContent = `${config.user.age} years old`;
    }
    config.user.days = day;
    day++;

    let income = 0;
    for (let item of config.user.items) {
      if (item.type === "sec" && item.currentAmount >= 1) {
        console.log(item.name, item.currentAmount);
        const total = item.perMoney * item.currentAmount;
        income += total;
      }
    }
    config.user.money += income;
    const money = userInfo.querySelector("#money");
    money.textContent = `money: ¥${config.user.money}`;
  }, 1000);
  return id;
}

function getPerMoney(item) {
  return item.type === "rate" ? item.perRate : item.perMoney;
}

function getType(item) {
  return item.type === "rate" ? "sec" : item.type;
}

function createItemData() {
  const items = [
    new Items(
      "Flip machine",
      "click",
      0,
      500,
      25,
      0,
      15000,
      "https://cdn.pixabay.com/photo/2019/06/30/20/09/grill-4308709_960_720.png"
    ),
    new Items(
      "ETF Stock",
      "rate",
      0,
      -1,
      0,
      0.1,
      300000,
      "https://cdn.pixabay.com/photo/2016/03/31/20/51/chart-1296049_960_720.png"
    ),
    new Items(
      "ETF Bonds",
      "rate",
      0,
      -1,
      0,
      0.07,
      300000,
      "https://cdn.pixabay.com/photo/2016/03/31/20/51/chart-1296049_960_720.png"
    ),
    new Items(
      "Lemonade Stand",
      "sec",
      0,
      1000,
      30,
      0,
      30000,
      "https://cdn.pixabay.com/photo/2012/04/15/20/36/juice-35236_960_720.png"
    ),
    new Items(
      "Ice Cream Truck",
      "sec",
      0,
      500,
      120,
      0,
      100000,
      "https://cdn.pixabay.com/photo/2020/01/30/12/37/ice-cream-4805333_960_720.png"
    ),
    new Items(
      "House",
      "sec",
      0,
      100,
      32000,
      0,
      20000000,
      "https://cdn.pixabay.com/photo/2016/03/31/18/42/home-1294564_960_720.png"
    ),
    new Items(
      "TownHouse",
      "sec",
      0,
      100,
      64000,
      0,
      40000000,
      "https://cdn.pixabay.com/photo/2019/06/15/22/30/modern-house-4276598_960_720.png"
    ),
    new Items(
      "Mansion",
      "sec",
      0,
      20,
      500000,
      0,
      250000000,
      "https://cdn.pixabay.com/photo/2017/10/30/20/52/condominium-2903520_960_720.png"
    ),
    new Items(
      "Industrial Space",
      "sec",
      0,
      10,
      2200000,
      0,
      1000000000,
      "https://cdn.pixabay.com/photo/2012/05/07/17/35/factory-48781_960_720.png"
    ),
    new Items(
      "Hotel Skyscraper",
      "sec",
      0,
      5,
      25000000,
      0,
      10000000000,
      "https://cdn.pixabay.com/photo/2012/05/07/18/03/skyscrapers-48853_960_720.png"
    ),
    new Items(
      "Bullet-Speed Sky Railway",
      "sec",
      0,
      1,
      30000000000,
      0,
      10000000000000,
      "https://cdn.pixabay.com/photo/2013/07/13/10/21/train-157027_960_720.png"
    ),
  ];
  return items;
}

//######### 定数宣言 ##########
const templateName = {
  top: "topTemplate",
  main: "mainTemplate",
};
const errorMessage = {
  requiredUserName: "ユーザ名を入力してください",
  lackOfMoney: "お金が足りません",
  overAmount: "最大購入数を超えています",
};

const init = {
  age: 20,
  days: 1,
  money: 50000,
};

const DAYS_IN_YEAR = 365;

new Top();
