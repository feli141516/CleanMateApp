import { RouterProvider } from "react-router";
import { CleanMateProvider } from "../state/CleanMateContext";
import { router } from "./routes";

export default function App() {
  return (
    <CleanMateProvider>
      <RouterProvider router={router} />
    </CleanMateProvider>
  );
}
