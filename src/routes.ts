import { Route } from '../lib/models/Route';
import App from './components/App';
import LoginForm from './components/LoginForm';
import Parent from './components/Parent';

const ROUTES: Route[] = [
    { path: '/login', view: LoginForm },
    { path: '/parent', view: Parent },
]

export default ROUTES;