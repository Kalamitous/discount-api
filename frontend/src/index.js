import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom"
import AdminView from './AdminView'
import CustomerView from './CustomerView'
import 'antd/dist/antd.css'
import './index.css'

ReactDOM.render(
    <div className="App">
        <div className="View">
            <BrowserRouter>
                <Switch>
                    <Route path="/admin">
                        <AdminView />
                    </Route>
                    <Route path="/customer">
                        <CustomerView />
                    </Route>
                    <Route path="/">
                        <Redirect to="/admin" />
                    </Route>
                </Switch>
            </BrowserRouter>
        </div>
    </div>, 
    document.getElementById('root')
)
