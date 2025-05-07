import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeProvider';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage'; 
import { ContentPage } from '@/pages/ContentPage';
import { NotFound } from '@/pages/NotFound'; 

// 临时占位组件 - 已被实际导入替换
// const HomePage = () => <div>首页占位</div>;
// const ContentPageWrapper = () => <div>内容页占位</div>;
// const NotFound = () => <div>404 页面未找到</div>;

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pages/:category/:slug" element={<ContentPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
