import { Head } from "$fresh/runtime.ts";
import AuthWrapper from "../islands/AuthWrapper.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>文件管理器</title>
      </Head>
      <AuthWrapper />
    </>
  );
}
