'use client';

import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import type { Analysis } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type ScreenshotViewerProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  analysis: Analysis;
};

export function ScreenshotViewer({
  isOpen,
  onOpenChange,
  analysis,
}: ScreenshotViewerProps) {
  const screenshots = analysis.screenshots
    .map((id) => PlaceHolderImages.find((img) => img.id === id))
    .filter(Boolean);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Screenshots for {new URL(analysis.url).hostname}</DialogTitle>
          <DialogDescription>
            Visual captures of the website during the scraping process.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4">
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {screenshots.map((screenshot, index) => (
                <CarouselItem key={index}>
                    <Card className="overflow-hidden">
                      <CardContent className="flex aspect-[16/10] items-center justify-center p-0">
                        {screenshot && (
                            <Image
                                src={screenshot.imageUrl}
                                alt={`Screenshot ${index + 1}`}
                                width={1280}
                                height={800}
                                className="h-full w-full object-cover"
                                data-ai-hint={screenshot.imageHint}
                            />
                        )}
                      </CardContent>
                    </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="ml-14" />
            <CarouselNext className="mr-14" />
          </Carousel>
        </div>
      </DialogContent>
    </Dialog>
  );
}
