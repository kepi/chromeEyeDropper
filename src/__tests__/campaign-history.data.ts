export const campaign: Campaign = {
  id: "maxai202401",
  url: "https://eyedropper.org/partners/maxai202401/",
  active: true,
}

export const december = {
  type: "onUpdate",
  id: "maxai202312",
  url: "https://api.maxai.me/app/promo?ref=eyedropper",
  date: "2023-12-21T15:02:27.526Z",
}

export const january = {
  type: "onUpdate",
  id: "maxai202401",
  url: "https://eyedropper.org/partners/maxai202401/",
  date: "2024-01-27T18:13:22.239Z",
}

// history with old style and correct information
export const oldCorrect = {
  maxai202312: december,
  maxai202401: january,
}

export const oldCorrectConverted = [december, january]

// this happened by mistake during january campaign and we need to be able to
// handle it better
export const oldWrong = {
  maxai202312: january,
}

export const newAlreadyOpened = [december, january]

export const newNotOpened = [december]

export const oldAlreadyOpened = {
  maxai202401: january,
}

export const oldNotOpened = {
  maxai202312: december,
}
