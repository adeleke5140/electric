import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useContext } from 'react';
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { SupabaseContext } from "../SupabaseContext";

import Logo from "../assets/logo.svg";

const SignIn: React.FC = () => {
  const supabase = useContext(SupabaseContext)!;
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <img src={Logo} alt="ElectricSQL" className="logo" />
            Electric Shop
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">
              <img src={Logo} alt="ElectricSQL" className="logo" />
              Electric Shop
            </IonTitle>
          </IonToolbar>
        </IonHeader>
          <div className="ion-padding">
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: 'var(--ion-color-primary)',
                      brandAccent: 'var(--ion-color-primary-shade)',
                    },
                  },
                },
                style: {
                  input: { color: "var(--ion-text-color)" },
                },
              }}
            />
          </div>
      </IonContent>
    </IonPage>
  );
};

export default SignIn;
