import LoginForm from './components/LoginForm';
import Nav from './components/nav/Nav';
import App from './components/App';
import Button from './components/Button';
import { ComponentRegistry } from '../lib/models/ComponentRegistry';

export const Components: ComponentRegistry = {
    declarations: [
        Nav(),
        Button(),
        LoginForm()
    ],
    bootStrap: App()
}
