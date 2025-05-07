import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // 导入 CardTitle
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { MetadataPage } from "@/types/metadata";

interface ContentCardProps {
  page: MetadataPage;
}

// 将英文类别转换为中文显示
const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    'ai-tech': 'AI技术与生态',
    'info-upgrade': '信息化升级',
    'knowledge': '知识报告',
    'research': '科研辅助'
  };
  return labels[category] || category;
};

export const ContentCard = ({ page }: ContentCardProps) => {
  // 从page.path提取slug
  // 假设 path 格式为 pages/category/filename.html
  const pathParts = page.path.split('/');
  const slugWithExtension = pathParts.pop() || ''; // 获取最后一部分，例如 filename.html
  const slug = slugWithExtension.substring(0, slugWithExtension.lastIndexOf('.')) || slugWithExtension; // 移除扩展名
  
  // 确保category存在，以防路径格式不符
  const category = page.category || (pathParts.length > 1 ? pathParts[pathParts.length - 1] : 'unknown'); 

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader>
        {/* 使用 CardTitle 并添加截断 */}
        <CardTitle className="text-lg font-semibold leading-tight line-clamp-2" title={page.title}>{page.title}</CardTitle>
        <Badge variant="outline" className="mt-2 w-fit">{getCategoryLabel(category)}</Badge>
      </CardHeader>
      <CardContent className="flex-grow">
        {/* 添加行数截断 */}
        <p className="text-sm text-muted-foreground line-clamp-3" title={page.description}>{page.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center mt-auto pt-4 border-t">
        <span className="text-xs text-muted-foreground">{page["publish-date"]}</span>
        <Link 
          to={`/pages/${category}/${slug}`}
          className="text-sm underline text-primary hover:text-primary/80 transition-colors"
        >
          查看详情
        </Link>
      </CardFooter>
    </Card>
  );
}; 