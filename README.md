<h1 align="center">
  <a style="font-style: italic" href="https://app-web.netlify.com/">Template</a> Website
</h1>

<h4 align="center">Template Website | <a href="https://app-web.netlify.com/" target="_blank">app-web.netlify.com</a></h4>

<blockquote align="center">
  <em style="font-weight: bold">Template Website</em> is a lightweight, fast, and efficient website template that is hosted on <a href="netlify.com">netlify</a>, and optimized for desktops, mobile phones, and tablets. It is designed for present ideas, dreams and passions, let's persue yours together.
</blockquote>

<p align="center">
  <a href="#getting-started">Getting started</a>&nbsp;|&nbsp;<a href="#documentation">Documentation</a>&nbsp;|&nbsp;<a href="#demos-and-examples">Demos and examples</a>&nbsp;|&nbsp;<a href="#browser-support">Browser support</a>
</p>

## Getting started

### *Prerequisites*
* Github Account (go to [github](github.com) to create an account)
* Website Repository (I would have already provided you with this)

If you don't want to do all this work you can leave it to me to design and post your website.

---

### *Edit Online*
Click [Gitpod](https://www.gitpod.io/#https://github.com/okikio/okikio) and sign up, to edit online and have everything you need to start editing all ready for you, if you use this option **skip** the download section and go straight to the [Launch](#launch) portion of the **Usage** section, of **Getting Started**.

--- 

### *Download*

**Install Node.js**

Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. For more information on using Node.js, see the [Node.js Website](https://nodejs.org/en/about/).

<p>
<strong>On Windows</strong><br>
To install node on Windows go here: <a href="https://blog.teamtreehouse.com/install-node-js-npm-windows">https://blog.teamtreehouse.com/install-node-js-npm-windows</a>
</p>

<p>
<strong>On Mac OS</strong><br>
To install node on Mac OS go here: <a href="https://blog.teamtreehouse.com/install-node-js-npm-mac">https://blog.teamtreehouse.com/install-node-js-npm-mac</a>
</p>

<p>
<strong>On Linux</strong><br>
To install node on Linux go here: <a href="https://blog.teamtreehouse.com/install-node-js-npm-linux">https://blog.teamtreehouse.com/install-node-js-npm-linux</a>
</p>


**Install Yarn**

Yarn is a fast, reliable, and secure dependency manager. Node.js automatically comes with one, it called npm ([Node Package Manager](https://www.npmjs.com/)) but I prefer yarn for it's speed and ease of use, for more information about [yarn](https://yarnpkg.com/en/). To install yarn you can go to it's site or install it using **npm** (ironically, using a package manager to install a package manager).

The command on all major OS's (Operating Systems) is the same, open your command prompt of choice and type this command:
```bash
$ npm install yarn -g
```
(don't type the $, it indicates that you’re doing this at the command line)

or manual [download](https://yarnpkg.com/en/docs/install#windows-stable).


**Install Git**

Git is a free and open source distributed version control system designed to handle everything from small to very large projects with speed and efficiency. Git is what allows you to publish your website online to be viewed, and also what allows you to rollback to a previous version if an error occurs. To install **git** you go to it's [site](https://git-scm.com/), you should see a download button for your operating system, click it and install git, for more information about [Git](https://git-scm.com/about).

Once git is installed you need to login to work on the website, so open your command prompt of choice and type:
```bash
$ git config --global user.name "Your name here"
$ git config --global user.email "your_email@example.com"
```
(don't type the $, it indicates that you’re doing this at the command line, and remember to replace the values in `"quotes"` with your [Github](github.com) account info)

---

### *Usage*

In the command prompt type the command **git clone `url`**, this will download the website from online, note this may take a couple seconds to a few minutes depending on the speed of your internet connection and the performance of your computer. The `url` can be determined by going to the repository url link I will give you. When typed into your command prompt it should look like this:
```bash
$ git clone https://github.com/okikio/app-web.git
```
(don't type the $, it indicates that you’re doing this at the command line, and remember to replace the url with your repository info) 

<h4 style="font-weight: bold" id="launch">Launch</h4>

Once the repository has been cloned go into the new folder that should have been created and open your command prompt in this folder. In the command prompt type the command **yarn**, this will start installing the packages required for the website, note this may take a couple seconds to a few minutes depending on the speed of your internet connection and the performance of your computer.
```bash
$ yarn
```
(don't type the $, it indicates that you’re doing this at the command line) 

Once **yarn** is done you should be able to now start editing your site, but first to see how your site looks, type into the command prompt:
```bash
$ yarn dev:watch
```
(don't type the $, it indicates that you’re doing this at the command line) 

## Documentation

## Demos and examples 

## Browser support