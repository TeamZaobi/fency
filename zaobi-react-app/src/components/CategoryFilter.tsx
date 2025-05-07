import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  // 可选：可以传入可用分类列表以动态生成Tabs
  // availableCategories?: string[]; 
}

// 假设分类是固定的
const categories = [
  { value: "all", label: "全部" },
  { value: "ai-tech", label: "AI技术与生态" },
  { value: "info-upgrade", label: "信息化升级" },
  { value: "knowledge", label: "知识报告" },
  { value: "research", label: "科研辅助" },
];

export const CategoryFilter = ({ 
  activeCategory,
  onCategoryChange
}: CategoryFilterProps) => {
  return (
    <Tabs defaultValue={activeCategory} onValueChange={onCategoryChange} className="w-full overflow-x-auto">
      <TabsList>
        {categories.map((category) => (
          <TabsTrigger key={category.value} value={category.value}>
            {category.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}; 