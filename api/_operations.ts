export const OPERATIONS = [
  {
    name: "Test1",
    body: "query Test1 { extraStuff }"
  },
  {
    name: "Test2",
    body: "query Test2 { allUsers { id transaction { amountInUserCurrency } } }"
  },
  {
    name: "Test3",
    body: "query Test3($id: ID!) { product(id: $id) { id description reviews { body } } }"
  }
];
