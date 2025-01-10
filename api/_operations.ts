export const OPERATIONS = [
  "query Test1 { extraStuff }",
  "query Test2 { allUsers { id transaction { amountInUserCurrency } } }",
  "query Test3($id: ID!) { product(id: $id) { id description reviews { body } } }"
];
