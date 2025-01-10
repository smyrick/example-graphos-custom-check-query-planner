export const OPERATIONS = [
  "query Test1 { extraStuff }",
  "query Test2 { allUsers { id transaction { amountInUserCurrency } } }",
  "query Test3 { product(id: $id) { id description reviews { body } } }",
  "query Test4 { brokenOperation }"
];
