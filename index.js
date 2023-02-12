const CronJob = require("cron").CronJob;
const os = require("os");
const { exec } = require("child_process");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const COMMANDS = {
  imageLs: "docker image ls",
  volumeLs: "docker volume ls",
};

let choice;

function main() {
  rl.question("Enter your choice: ", (answer) => {
    choice = answer;
    if (choice === "images") {
      dockerImages()
        .then((data) => {
          const images = data.stdout.split("\n");
          const danglingImgs = images.filter((image) =>
            image.startsWith("<none>")
          );
          console.log(
            "......... dangling images count........ ",
            danglingImgs.length
          );
          rl.question("Do you want to delete dangling images?: ", (reply) => {
            if (reply === "yes") {
              deleteDanglingImages();
              console.log("successfully deleted");
              rl.close();
            } else {
              rl.close();
            }
          });
        })
        .catch((err) => console.log(err));
    } else if (choice === "volumes") {
      dockerVolumes()
        .then((data) => {
          const volumes = data.stdout.split("\n");
          console.log(
            "......... dangling images count........ ",
            volumes.length
          );

          rl.question("Delete dangling volumes?: ", (reply) => {
            if (reply === "yes") {
              deleteDanglingVolumes();
              console.log("Deleted volumes...");
              rl.close();
            } else {
              rl.close();
            }
          });
        })
        .catch((err) => console.log(err));
    } else {
      console.log("Invalid choice, please try again.");
      rl.close();
    }
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

