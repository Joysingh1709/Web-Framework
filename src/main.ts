import CoreFramework from '../lib/core/core';
import ROUTES from '../src/routes';
import './app.css';
import './bootstrap.css';
import { Components } from './Declarations';

new CoreFramework(Components).init(ROUTES);