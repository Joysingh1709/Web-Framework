import LoginForm from './components/LoginForm';
import Nav from './components/nav/Nav';
import App from './components/App';
import Parent from './components/Parent';
import Child from './components/Child';
import Button from './components/Button';
import { ComponentRegistry } from '../lib/models/ComponentRegistry';
import CustomEvent from 'lib/core/CustomEvent';

export const Components: ComponentRegistry = {
    declarations: [
        Nav(),
        Button(),
        Parent(),
        Child(null),
        LoginForm()
    ],
    bootStrap: App()
}
