const CronJob = require("cron").CronJob;
const os = require("os");
const { exec } = require("child_process");


function main() {
  // Deleting both volumes and images
  Promise.all([dockerImages(), dockerVolumes()])
    .then((values) => {
      // Handle the resolved values
      const images = values[0].stdout.split("\n");
      const danglingImgs = images.filter((image) => image.startsWith("<none>"));
      console.log(
        "......... dangling images count........ ",
        danglingImgs.length
      );
      deleteDanglingImages();
      console.log("successfully deleted dangling images");

      const volumes = values[1];
      console.log("......... dangling images count........ ", volumes.length);
      deleteDanglingVolumes()
      console.log("successfully deleted dangling volumes");
    })
    .catch((error) => {
      // Handle the erro
      console.log(error);
    });
}

function dockerImages() {
  return new Promise((resolve, reject) => {
    exec(COMMANDS.imageLs, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

function dockerVolumes() {
  return new Promise((resolve, reject) => {
    exec(COMMANDS.volumeLs, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

function deleteDanglingImages() {
  exec(
    'docker rmi $(docker images -f "dangling=true" -q)',
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    }
  );
}

function deleteDanglingVolumes() {
  exec(
    'docker volume rm $(docker volume ls -qf "dangling=true")',
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    }
  );
}

const dockerJobMonitor = new CronJob("* * * * *", () => {
  main();
});
