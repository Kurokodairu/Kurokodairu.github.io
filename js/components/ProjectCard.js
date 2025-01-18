import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
export const ProjectCard = ({ title, description, technologies, imageUrl }) => {
    return (<Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white">
      <div className="h-48 overflow-hidden">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"/>
      </div>
      <CardHeader>
        <CardTitle className="text-xl text-primary">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {technologies.map((tech) => (<Badge key={tech} variant="secondary" className="bg-primary-light text-primary">
              {tech}
            </Badge>))}
        </div>
      </CardContent>
    </Card>);
};
