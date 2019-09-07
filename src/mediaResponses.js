const fs = require('fs');
const path = require('path');

const createStream = (request, response, range, stats, file, fileType) => {
  // grab the byte range from the request's range header and then check if
  // we got an end position from the client
  const positions = range.replace(/bytes=/, '').split('-');

  let start = parseInt(positions[0], 10);

  const total = stats.size;
  const end = positions[1] ? parseInt(positions[1], 10) : total - 1;

  if (start > end) {
    start = end - 1;
  }

  // determine how big of a chunk we are sending back to the browser in bytes
  const chunksize = end - start + 1;

  response.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${total}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunksize,
    'Content-Type': fileType,
  });

  const stream = fs.createReadStream(file, { start, end });

  stream.on('open', () => {
    stream.pipe(response);
  });

  stream.on('error', (streamErr) => {
    response.end(streamErr);
  });

  return stream;
};

const loadFile = (request, response, filePath, fileType) => {
  const file = path.resolve(__dirname, filePath);

  fs.stat(file, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        response.writeHead(404);
      }
      return response.end(err);
    }

    // see if client can send a range header. if there is no range header,
    // then assume we will be starting at the beginning of the file
    let { range } = request.headers;

    if (!range) {
      range = 'bytes=0-';
    }

    const newStream = createStream(
      request,
      response,
      range,
      stats,
      file,
      fileType,
    );
    return newStream;
  });
};

const getParty = (request, response) => {
  //   // create a File object based on the and provide stats about it
  //   const file = path.resolve(__dirname, "../client/party.mp4");

  //   fs.stat(file, (err, stats) => {
  //     if (err) {
  //       if (err.code === "ENOENT") {
  //         response.writeHead(404);
  //       }
  //       return response.end(err);
  //     }
  //     // createFile(response, "../client/party.mp4");

  //     // see if client can send a range header. if there is no range header,
  //     // then assume we will be starting at the beginning of the file
  //     let { range } = request.headers;

  //     if (!range) {
  //       range = "bytes=0-";
  //     }

  //     // grab the byte range from the request's range header and then check if
  //     // we got an end position from the client
  //     const positions = range.replace(/bytes=/, "").split("-");

  //     let start = parseInt(positions[0], 10);

  //     const total = stats.size;
  //     const end = positions[1] ? parseInt(positions[1], 10) : total - 1;

  //     if (start > end) {
  //       start = end - 1;
  //     }

  //     // determine how big of a chunk we are sending back to the browser in bytes
  //     const chunksize = end - start + 1;

  //     response.writeHead(206, {
  //       "Content-Range": `bytes ${start}-${end}/${total}`,
  //       "Accept-Ranges": "bytes",
  //       "Content-Length": chunksize,
  //       "Content-Type": "video.mp4"
  //     });

  //     // create a file stream so that it takes a File object and an object containing
  //     // the start and end points in bytes. that way, we will only load the amount of
  //     // the files necessary
  //     const stream = fs.createReadStream(file, { start, end });

  //     stream.on("open", () => {
  //       stream.pipe(response);
  //     });

  //     stream.on("error", streamErr => {
  //       response.end(streamErr);
  //     });

  //     return stream;
  //   });

  loadFile(request, response, '../client/party.mp4', 'video/mp4');
};

const getBling = (request, response) => {
  loadFile(request, response, '../client/bling.mp3', 'audio/mpeg');
};

const getBird = (request, response) => {
  loadFile(request, response, '../client/bird.mp4', 'video/mp4');
};

module.exports.getParty = getParty;
module.exports.getBling = getBling;
module.exports.getBird = getBird;
