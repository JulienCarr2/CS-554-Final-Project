import { configureStore } from "@reduxjs/toolkit";
import { composeWithDevTools } from "@redux-devtools/extension";
import rootReducer from "../src/reducers/rootReducer";

const store = configureStore({ reducer: rootReducer }, composeWithDevTools());

export default store;
