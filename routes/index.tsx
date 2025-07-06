import { Head } from "$fresh/runtime.ts";
import FileManager from "../islands/FileManager.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>文件管理器</title>
      </Head>
      <FileManager />
    </>
  );
}
