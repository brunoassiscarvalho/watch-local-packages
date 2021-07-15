var watchman = require('fb-watchman');
var client = new watchman.Client();
const path = require("path");
const fs = require("fs");

const yargs = require('yargs');

const argv = yargs
  .command('lyr', 'Tells whether an year is leap year or not', {
    year: {
      description: 'the year to check for',
      alias: 'y',
      type: 'number',
    }
  })
  .option('time', {
    alias: 't',
    description: 'Tell the present Time',
    type: 'boolean',
  })
  .help()
  .alias('help', 'h')
  .argv;

if (!argv.path && !argv.project) {
  console.error("Erro: ", "Informe ao menos um dos parametros: 'path' ou 'project'")
  return
}

// if (argv._.includes('lyr')) {
//   const year = argv.year || new Date().getFullYear();
//   if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) {
//     console.log(`${year} is a Leap Year`);
//   } else {
//     console.log(`${year} is NOT a Leap Year`);
//   }
// }

console.log(argv);

var parentProjectPath = !!argv.project ? `../${argv.project}` : argv.path

var packageJson = require(parentProjectPath + "/package.json")

function copyFileSync(source, target) {
  var targetFile = target;

  // If target is a directory, a new file with the same name will be created
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

const startWatch = (project_name) => {
  const dir_of_interest = path.resolve(parentProjectPath, `../${project_name}`)

  client.capabilityCheck({ optional: [], required: ['relative_root'] },
    function (error, resp) {
      if (error) {
        console.log(error);
        client.end();
        return;
      }

      // Initiate the watch
      client.command(['watch-project', dir_of_interest],
        function (error, resp) {
          if (error) {
            console.error('Error initiating watch:', error);
            return;
          }

          // It is considered to be best practice to show any 'warning' or
          // 'error' information to the user, as it may suggest steps
          // for remediation
          if ('warning' in resp) {
            console.log('warning: ', resp.warning);
          }

          // `watch-project` can consolidate the watch for your
          // dir_of_interest with another watch at a higher level in the
          // tree, so it is very important to record the `relative_path`
          // returned in resp

          console.log('watch established on ', resp.watch,
            ' relative_path', resp.relative_path);
          make_subscription(client, resp.watch, project_name, resp.relative_path)
        });
    });
}




// `watch` is obtained from `resp.watch` in the `watch-project` response.
// `relative_path` is obtained from `resp.relative_path` in the
// `watch-project` response.
function make_subscription(client, watch, project_name, relative_path) {
  sub = {
    // Match any `.js` file in the dir_of_interest
    expression: ["anyof", ["match", "*.tsx"], ["match", "*.js"], ["match", "*.ts"]],
    // Which fields we're interested in
    fields: ["name", "size", "mtime_ms", "exists", "type"]
  };
  if (relative_path) {
    sub.relative_root = relative_path;
  }

  client.command(['subscribe', watch, 'mysubscription', sub],
    function (error, resp) {
      if (error) {
        // Probably an error in the subscription criteria
        console.error('failed to subscribe: ', error);
        return;
      }
      console.log('subscription ' + resp.subscribe + ' established');
    });

  // Subscription results are emitted via the subscription event.
  // Note that this emits for all subscriptions.  If you have
  // subscriptions with different `fields` you will need to check
  // the subscription name and handle the differing data accordingly.
  // `resp`  looks like this in practice:
  //
  // { root: '/private/tmp/foo',
  //   subscription: 'mysubscription',
  //   files: [ { name: 'node_modules/fb-watchman/index.js',
  //       size: 4768,
  //       exists: true,
  //       type: 'f' } ] }
  client.on('subscription', function (resp) {
    if (resp.subscription !== 'mysubscription') return;

    resp.files.forEach(function (file) {
      // convert Int64 instance to javascript integer
      const mtime_ms = +file.mtime_ms;
      const source = path.resolve(parentProjectPath, '../') + "/" + project_name + "/" + file.name
      const target = path.resolve(parentProjectPath) + "/node_modules" + "/" + project_name + "/" + file.name

      console.log(source)
      console.log(target)
      // console.log(file)
      copyFileSync(source, target)
      // console.log('file changed: ' + file.name, mtime_ms);
    });
  });
}

const getLocaldependencies = () => {
  Object.keys(packageJson.dependencies).map((package) => {
    const value = packageJson.dependencies[package];
    if (value.includes("../")) {
      const [prefix, projectName] = value.split("../");
      console.log({ projectName })
      startWatch(projectName)
    }

  })
}

getLocaldependencies();