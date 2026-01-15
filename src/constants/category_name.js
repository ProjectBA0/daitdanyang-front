// URL / 라우팅 용 (영문)
const PUBLIC = process.env.PUBLIC_URL;

export const CATEGORY_ORDER = {
    dog: [
        "feed",
        "snack",
        "toilet",
        "bath",
        "bowl",
        "house",
        "health",
        "clothes",
        "petwalking",
        "toy",
        "carrier"
    ],
    cat: [
        "feed",
        "can",
        "snack",
        "litter",
        "toilet",
        "bath",
        "bowl",
        "house",
        "health",
        "clothes",
        "life",
        "toy",
        "carrier"
    ],
    small: [],
};

// 화면표시 / DB category (한글)
export const CATEGORY = {
  feed:   { label: "사료", img: `${PUBLIC}/images/category/feed.png`, db: "사료" },
  can:    { label: "캔", img: `${PUBLIC}/images/category/can.png`, db: "캔" },
  snack:  { label: "간식", img: `${PUBLIC}/images/category/snack.png`, db: "간식" },
  toilet: { label: "위생/화장실", img: `${PUBLIC}/images/category/toilet.png`, db: ["화장실","위생"] },
  house:  { label: "하우스/울타리", img: `${PUBLIC}/images/category/house.png`, db: "하우스" },
  bath:   { label: "미용/목욕", img: `${PUBLIC}/images/category/bath.png`, db:["목욕","미용"] },
  bowl:   { label: "식기", img: `${PUBLIC}/images/category/bowl.png`, db: ["급수기", "식기"] },
  health: { label: "건강관리", img: `${PUBLIC}/images/category/health.png`, db: "건강관리" },
  clothes:{ label: "의류", img: `${PUBLIC}/images/category/clothes.png`, db: ["의류","산책용품"] },
  life:   { label: "캣타워", img: `${PUBLIC}/images/category/life.png`, db: "캣타워" },
  toy:    { label: "장난감", img: `${PUBLIC}/images/category/toy.png`, db: "장난감" },
  carrier:{ label: "이동장", img: `${PUBLIC}/images/category/carrier.png`, db: "이동장" },
  litter: { label: "모래", img: `${PUBLIC}/images/category/litter.png`, db: "모래" },
  petwalking: { label: "목줄/리드줄", img: `${PUBLIC}/images/category/petwalking.png`, db: "산책용품" },
};