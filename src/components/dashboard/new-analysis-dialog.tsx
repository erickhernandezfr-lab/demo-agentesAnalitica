'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { useRouter } from 'next/navigation';
import { functions } from '@/lib/firebase';
import { httpsCallable, HttpsCallableResult } from 'firebase/functions';

// 1. Hardcoded data for the MOCK flow
const mockScraperData = [
  {
    "url": "https://multiplica.com/",
    "tipo_pagina": "landing",
    "ref_grid": { "who": "boxes", "width": 2732, "height": 17570 },
    "image_size": { "width": 2732, "height": 17570 },
    "screenshot": "outputs/screens/page_01.png",
    "coordmap": "outputs/coordmaps/page_01_coordmap.png",
    "overlay": "outputs/crops/page_01/overlay.png",
    "componentes": [
      { "nombre": "hero_banner", "tipo": "hero", "box_json": [0, 0, 1000, 285], "box_px": [0, 0, 1000, 285], "crop": "outputs/crops/page_01/01_hero_banner.png" },
      { "nombre": "casos_de_exito", "tipo": "section", "box_json": [0, 285, 1000, 539], "box_px": [0, 285, 1000, 539], "crop": "outputs/crops/page_01/02_casos_de_exito.png" },
      { "nombre": "seccion_descubre", "tipo": "section", "box_json": [0, 539, 1000, 901], "box_px": [0, 539, 1000, 901], "crop": "outputs/crops/page_01/03_seccion_descubre.png" },
      { "nombre": "nuestros_partners", "tipo": "section", "box_json": [0, 901, 1000, 1157], "box_px": [0, 901, 1000, 1157], "crop": "outputs/crops/page_01/04_nuestros_partners.png" },
      { "nombre": "como_lo_hacemos", "tipo": "section", "box_json": [0, 1157, 1000, 1345], "box_px": [0, 1157, 1000, 1345], "crop": "outputs/crops/page_01/05_como_lo_hacemos.png" },
      { "nombre": "nuestros_clientes", "tipo": "section", "box_json": [0, 1345, 1000, 1601], "box_px": [0, 1345, 1000, 1601], "crop": "outputs/crops/page_01/06_nuestros_clientes.png" },
      { "nombre": "somos_globales", "tipo": "section", "box_json": [0, 1601, 1000, 1857], "box_px": [0, 1601, 1000, 1857], "crop": "outputs/crops/page_01/07_somos_globales.png" },
      { "nombre": "trabajemos_juntos", "tipo": "section", "box_json": [0, 1857, 1000, 2045], "box_px": [0, 1857, 1000, 2045], "crop": "outputs/crops/page_01/08_trabajemos_juntos.png" },
      { "nombre": "newsletter", "tipo": "formulario", "box_json": [0, 2045, 1000, 2301], "box_px": [0, 2045, 1000, 2301], "crop": "outputs/crops/page_01/09_newsletter.png" },
      { "nombre": "footer", "tipo": "footer", "box_json": [0, 2301, 1000, 2489], "box_px": [0, 2301, 1000, 2489], "crop": "outputs/crops/page_01/10_footer.png" },
      { "nombre": "navbar", "tipo": "navbar", "box_json": [0, 0, 1000, 50], "box_px": [0, 0, 1000, 50], "crop": "outputs/crops/page_01/11_navbar.png" }
    ]
  },
  {
    "url": "https://multiplica.com/terminos-y-condiciones/",
    "tipo_pagina": "landing",
    "ref_grid": { "who": "boxes", "width": 2732, "height": 1950 },
    "image_size": { "width": 2732, "height": 1950 },
    "screenshot": "outputs/screens/page_02.png",
    "coordmap": "outputs/coordmaps/page_02_coordmap.png",
    "overlay": "outputs/crops/page_02/overlay.png",
    "componentes": [
        { "nombre": "logo", "tipo": "logo", "box_json": [25, 26, 155, 48], "box_px": [25, 26, 155, 48], "crop": "outputs/crops/page_02/01_logo.png" },
        { "nombre": "navbar", "tipo": "navbar", "box_json": [540, 26, 973, 50], "box_px": [540, 26, 973, 50], "crop": "outputs/crops/page_02/02_navbar.png" },
        { "nombre": "titulo_principal", "tipo": "hero", "box_json": [40, 147, 400, 282], "box_px": [40, 147, 400, 282], "crop": "outputs/crops/page_02/03_titulo_principal.png" },
        { "nombre": "formulario_newsletter", "tipo": "formulario", "box_json": [540, 147, 973, 622], "box_px": [540, 147, 973, 622], "crop": "outputs/crops/page_02/04_formulario_newsletter.png" }
    ]
  },
  {
    "url": "https://multiplica.com/configuracion-de-cookies/",
    "tipo_pagina": "landing",
    "ref_grid": { "who": "boxes", "width": 2732, "height": 1950 },
    "image_size": { "width": 2732, "height": 1950 },
    "screenshot": "outputs/screens/page_03.png",
    "coordmap": "outputs/coordmaps/page_03_coordmap.png",
    "overlay": "outputs/crops/page_03/overlay.png",
    "componentes": [
        { "nombre": "logo", "tipo": "logo", "box_json": [24, 24, 145, 51], "box_px": [24, 24, 145, 51], "crop": "outputs/crops/page_03/01_logo.png" },
        { "nombre": "navbar", "tipo": "navbar", "box_json": [547, 25, 971, 51], "box_px": [547, 25, 971, 51], "crop": "outputs/crops/page_03/02_navbar.png" },
        { "nombre": "boton_hablemos", "tipo": "boton", "box_json": [872, 25, 971, 51], "box_px": [872, 25, 971, 51], "crop": "outputs/crops/page_03/03_boton_hablemos.png" },
        { "nombre": "titulo_newsletter", "tipo": "hero", "box_json": [40, 160, 302, 292], "box_px": [40, 160, 302, 292], "crop": "outputs/crops/page_03/04_titulo_newsletter.png" }
    ]
  }
];
const mockAiReport = "Análisis de IA (MOCK): La estructura del sitio web es robusta. Se identificaron 10 componentes clave en la landing page. La arquitectura es apta para la extracción de datos. Los resultados del scraper están listos para la visualización.";


export function NewAnalysisDialog() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleStartSession = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const agentType = formData.get('agentType');
    const url = formData.get('url');
    const pages = formData.get('pages');
    const device = formData.get('device');

    // 2. MOCK FLOW CONDITION
    if (
      agentType === 'insight_forge' &&
      url === 'https://multiplica.com' &&
      pages === '3' &&
      device === 'desktop'
    ) {
      toast({
        title: 'Starting MOCK Analysis...',
        description: 'Simulating scraper execution. Please wait.',
      });

      // Simulate Scrapping Latency
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Simulate Job Creation and store data for the next page
      const mockJobId = 'mock-job-demo';
      localStorage.setItem('mockScraperData', JSON.stringify(mockScraperData));
      localStorage.setItem('mockAiReport', mockAiReport);
      
      toast({
        title: 'Scrapping Complete!',
        description: `Job ID: ${mockJobId}. Redirecting...`,
      });

      // Redirect to the mock job page
      setIsDialogOpen(false); 
      router.push(`/dashboard/jobs/${mockJobId}`);
      setLoading(false);
      
      return; // End execution here for the mock flow
    }

    // --- Original Flow (if mock conditions are not met) ---
    const data = { agentType, url, pages, device };
    
    try {
      const startInsightForge = httpsCallable(functions, 'startInsightForge');
      const result: HttpsCallableResult<any> = await startInsightForge(data);
      const { jobId } = result.data;
      
      toast({
        title: 'Success',
        description: 'Analysis job started. Redirecting to job details...',
      });

      setIsDialogOpen(false); 
      router.push(`/dashboard/jobs/${jobId}`);

    } catch (error: any) {
      console.error("Firebase Callable Error:", error);
      toast({
        title: 'Error',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleStartSession}>
          <DialogHeader>
            <DialogTitle>New Analysis Session</DialogTitle>
            <DialogDescription>
              Provide the details for the new analysis session.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agent" className="text-right">
                Agent
              </Label>
              <div className="col-span-3">
                <Select name="agentType" defaultValue="insight_forge">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="insight_forge">Insight Forge</SelectItem>
                    <SelectItem value="monitoring" disabled>Performance Monitoring</SelectItem>
                    <SelectItem value="audit" disabled>Audit & Recalibration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                URL
              </Label>
              <div className="col-span-3">
                <Input
                  id="url"
                  name="url"
                  placeholder="https://multiplica.com"
                  required
                  type="url"
                  defaultValue="https://multiplica.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pages" className="text-right">
                Pages
              </Label>
              <div className="col-span-3">
                <Input
                  id="pages"
                  name="pages"
                  type="number"
                  defaultValue="3"
                  min="1"
                  max="10"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Device</Label>
              <div className="col-span-3">
                <RadioGroup name="device" defaultValue="desktop" className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="desktop" id="desktop" />
                    <Label htmlFor="desktop">Desktop</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mobile" id="mobile" />
                    <Label htmlFor="mobile">Mobile</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                'Start Session'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
