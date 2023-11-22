import { useState, useEffect, useContext } from 'react'
import { Redirect, Route } from 'react-router-dom'
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonBadge,
} from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import {
  bagOutline,
  personOutline,
  searchOutline,
  shirtOutline,
} from 'ionicons/icons'

import { LIB_VERSION } from 'electric-sql/version'
import { uniqueTabId } from 'electric-sql/util'
import { useLiveQuery } from 'electric-sql/react'
import { ElectricDatabase, electrify } from 'electric-sql/wa-sqlite'
import { ElectricProvider, Electric, schema } from './electric'

import Shop from './pages/Shop'
import Item from './pages/Item'
import Bag from './pages/Bag'
import Account from './pages/Account'
import Order from './pages/Order'
import BasketCount from './components/BasketCount'
import { SupabaseContext } from './SupabaseContext'
import { getSupabaseJWT } from './utils'

const MainRoutes = () => {
  const [electric, setElectric] = useState<Electric>()
  const { supabase } = useContext(SupabaseContext)!

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      const token = await getSupabaseJWT(supabase)

      const config = {
        auth: { token },
        debug: import.meta.env.DEV,
        url: import.meta.env.ELECTRIC_URL,
      }

      const { tabId } = uniqueTabId()
      const scopedDbName = `basic-${LIB_VERSION}-${tabId}.db`

      const conn = await ElectricDatabase.init(scopedDbName, '')
      const electric = await electrify(conn, schema, config)

      // This is a simplification for now until we have "shapes"
      const syncItems = await electric.db.items.sync() // All items in the shop
      const syncBaskets = await electric.db.basket_items.sync({
        // All items in the user's basket
        include: {
          items: true,
          orders: true,
        },
      })
      const syncOrders = await electric.db.orders.sync({
        // All orders for the user
        include: {
          basket_items: {
            include: {
              items: true,
            },
          },
        },
      })
      await syncItems.synced
      await syncBaskets.synced
      await syncOrders.synced

      if (!isMounted) {
        return
      }

      setElectric(electric)
    }

    init()

    return () => {
      isMounted = false
    }
  }, [])

  if (electric === undefined) {
    return null
  }

  return (
    <ElectricProvider db={electric}>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/shop">
              <Shop />
            </Route>
            <Route exact path="/item/:id">
              <Item />
            </Route>
            <Route exact path="/account">
              <Account />
            </Route>
            <Route exact path="/bag">
              <Bag />
            </Route>
            <Route exact path="/account/order/:id">
              <Order />
            </Route>
            <Route exact path="/">
              <Redirect to="/shop" />
            </Route>
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="shop" href="/shop">
              <IonIcon aria-hidden="true" icon={shirtOutline} />
              <IonLabel>Store</IonLabel>
            </IonTabButton>
            <IonTabButton tab="search" href="/search" disabled>
              <IonIcon aria-hidden="true" icon={searchOutline} />
              <IonLabel>Search</IonLabel>
            </IonTabButton>
            <IonTabButton tab="account" href="/account">
              <IonIcon aria-hidden="true" icon={personOutline} />
              <IonLabel>Account</IonLabel>
            </IonTabButton>
            <IonTabButton tab="bag" href="/bag">
              <IonIcon aria-hidden="true" icon={bagOutline} />
              <IonLabel>Bag</IonLabel>
              <BasketCount />
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </ElectricProvider>
  )
}

export default MainRoutes
