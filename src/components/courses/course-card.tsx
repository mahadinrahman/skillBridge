import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import type { CourseWithId } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

interface CourseCardProps {
  course: CourseWithId;
}
export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={course.image}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      </div>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary">{course.category}</Badge>
          <div className="flex items-center gap-1 text-sm text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            <span>{course.rating.toFixed(1)}</span>
          </div>
        </div>
        <h3 className="line-clamp-2 text-lg font-semibold leading-tight">
          {course.title}
        </h3>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {course.shortDescription}
        </p>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{course.level}</span>
          <span className="text-lg font-bold text-primary">
            {formatPrice(course.price)}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" asChild>
          <Link href={`/courses/${course.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
