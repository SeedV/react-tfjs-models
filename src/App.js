/**
 * @license
 * Copyright 2021-2022 The SeedV Lab.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from 'react-router-dom';
import CartoonMirror from './demos/CartoonMirror';
import FaceMeshDemo from './demos/FaceMeshDemo';
import RockPaperScissors from './demos/RockPaperScissors';
import VideoPlaybackDemo from './demos/VideoPlaybackDemo';

const pathRockPaperScissors = '/rockpaperscissors';
const pathCartoonMirror = '/cartoonmirror';
const pathFaceMesh = '/facemesh';
const pathVideoPlayback = '/videoplayback';

/**
 * The app component.
 * @return {JSX.Element}
 */
function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route path="/" exact>
          This page shows a list of demos in this project.
            <ul>
              <li>
                <Link to={pathRockPaperScissors}>RockPaperScissors</Link>
              </li>
              <li>
                <Link to={pathCartoonMirror}>CartoonMirror</Link>
              </li>
              <li>
                <Link to={pathFaceMesh}>FaceMesh</Link>
              </li>
              <li>
                <Link to={pathVideoPlayback}>VideoPlayback</Link>
              </li>
            </ul>
          </Route>
          <Route path={pathRockPaperScissors}>
            <RockPaperScissors />
          </Route>
          <Route path={pathCartoonMirror}>
            <CartoonMirror />
          </Route>
          <Route path={pathFaceMesh}>
            <FaceMeshDemo />
          </Route>
          <Route path={pathVideoPlayback}>
            <VideoPlaybackDemo />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
