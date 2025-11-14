import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { CloudRain, MapPin, Clock } from 'lucide-react';

export const metadata = {
  title: 'Om Kjørefore - Værbevisst ruteplanlegger',
  description: 'Lær mer om Kjørefore, værbevisst ruteplanlegger for bilreiser i Norge',
};

export default function OmPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <CloudRain className="w-12 h-12 text-primary" />
              <h1 className="text-4xl font-bold">Om Kjørefore</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Værbevisst ruteplanlegger for bilreiser i Norge
            </p>
          </div>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Hva er Kjørefore?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Kjørefore er en tjeneste som gir deg værvarsel langs hele kjøreruten din.
              Vi kombinerer ruteplanlegging med værdata for å hjelpe deg med å planlegge
              tryggere bilreiser.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Med Kjørefore får du oversikt over værforholdene på hele reisen, ikke bare
              ved start og destinasjon. Dette gjør det lettere å forberede seg på utfordrende
              værforhold underveis.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Hvordan fungerer det?</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">1. Søk etter rute</h3>
                  <p className="text-muted-foreground">
                    Angi startsted, destinasjon og avreisetidspunkt
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CloudRain className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">2. Få værdata</h3>
                  <p className="text-muted-foreground">
                    Vi henter værvarsel for punkter langs hele ruten din
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Clock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">3. Se tidslinje</h3>
                  <p className="text-muted-foreground">
                    Få oversikt over hvordan været utvikler seg underveis på turen
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Datakilder</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Kjørefore bruker:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Google Maps for ruteplanlegging og kartdata</li>
              <li>Meteorologisk institutt (MET) for værdata</li>
            </ul>
          </Card>

          <Card className="p-6 bg-blue-50 border-blue-200">
            <h2 className="text-2xl font-semibold mb-4">Viktig informasjon</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Kjørefore er et verktøy for å planlegge reiser, men værvarslene er veiledende.
              Vær alltid oppmerksom på lokale forhold og kjør etter forholdene.
              Sjekk veimeldinger og vær forberedt på å endre planer ved behov.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
