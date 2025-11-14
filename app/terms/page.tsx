import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';

export const metadata = {
  title: 'Vilkår - Kjørefore',
  description: 'Brukervilkår og personvernerklæring for Kjørefore',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Brukervilkår</h1>
            <p className="text-muted-foreground">
              Sist oppdatert: {new Date().toLocaleDateString('nb-NO')}
            </p>
          </div>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">1. Aksept av vilkår</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ved å bruke Kjørefore aksepterer du disse brukervilkårene.
              Hvis du ikke aksepterer vilkårene, må du ikke bruke tjenesten.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">2. Tjenestebeskrivelse</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Kjørefore er en gratis tjeneste som gir værvarsel langs kjøreruter i Norge.
              Tjenesten kombinerer data fra Google Maps og Meteorologisk institutt.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Vi forbeholder oss retten til å endre, suspendere eller avslutte tjenesten
              når som helst uten forvarsel.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">3. Bruk av tjenesten</h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="leading-relaxed">Du samtykker til å:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Bruke tjenesten kun til lovlige formål</li>
                <li>Ikke misbruke eller overbelaste tjenesten</li>
                <li>Ikke forsøke å få uautorisert tilgang til systemet</li>
              </ul>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">4. Ansvarsfraskrivelse</h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="leading-relaxed">
                Kjørefore tilbys &quot;som den er&quot; uten garantier av noe slag.
              </p>
              <p className="leading-relaxed">
                Værvarslene er veiledende og kan ikke garanteres å være nøyaktige.
                Du er selv ansvarlig for å vurdere værforhold og kjøreforhold.
              </p>
              <p className="leading-relaxed font-semibold">
                Vi er ikke ansvarlige for skader, tap eller forsinkelser som følge av
                bruk av tjenesten.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">5. Personvern</h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="leading-relaxed">
                Kjørefore samler inn følgende data:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Søk etter ruter (startsted, destinasjon, tidspunkt)</li>
                <li>Din posisjon hvis du bruker &quot;Min posisjon&quot;-funksjonen</li>
              </ul>
              <p className="leading-relaxed mt-4">
                Vi deler data med:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Google Maps API for ruteberegning og kartvisning</li>
                <li>Meteorologisk institutt for værdata</li>
              </ul>
              <p className="leading-relaxed mt-4">
                Vi lagrer ikke personlige data permanent. Søkehistorikk lagres kun
                i nettleserens minne og slettes når du lukker siden.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">6. Tredjepartstjenester</h2>
            <p className="text-muted-foreground leading-relaxed">
              Kjørefore bruker følgende tredjepartstjenester:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4 text-muted-foreground">
              <li>
                <strong>Google Maps:</strong> Se{' '}
                <a
                  href="https://policies.google.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google Maps vilkår
                </a>
              </li>
              <li>
                <strong>Meteorologisk institutt:</strong> Se{' '}
                <a
                  href="https://www.met.no/om-oss/personvern"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  MET.no personvern
                </a>
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">7. Endringer i vilkårene</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vi kan oppdatere disse vilkårene fra tid til annen. Fortsatt bruk av
              tjenesten etter endringer betyr at du aksepterer de nye vilkårene.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">8. Kontakt</h2>
            <p className="text-muted-foreground leading-relaxed">
              Hvis du har spørsmål om disse vilkårene, kan du kontakte oss via
              GitHub-repositoriet til prosjektet.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
