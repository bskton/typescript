export async function twoPeers() {
  /**
   * This is happening with the first user.
   */
    // (1) Create new RTCPeerConnection object
  let pc1 = new RTCPeerConnection();
  console.log('pc1', pc1);

  // Don't look at the line. pc2 in real life create at another user
  let pc2 = new RTCPeerConnection(); // But this example is without signaling server, so we create pc2 here.

  pc1.addEventListener('icecandidate', async e => {
    console.log('pc1 icecandidate', e);
    // (5) After setting local session description to pc1 'icecandidate' events happens
    // In real life we need to send e.candidate to a signaling server
    if (e.candidate) {
      await pc2.addIceCandidate(e.candidate);
      console.log('Added ice candidate to pc2', e.candidate);
    }
  });
  pc1.addEventListener('iceconnectionstatechange', e => {
    console.log('pc1 iceconnectionstatechange', e);
    console.log('pc1', pc1);
  });
  pc1.addEventListener('negotiationneeded', e => {
    console.log('pc1 negotiationneeded', e);
  });

  pc2.addEventListener('icecandidate', async e => {
    console.log('pc2 icecandidate', e);
    // (?) After setting local session description to pc2 'icecandidate' events happens
    // In real life we need to send e.candidate to a signaling server
    if (e.candidate) {
      const iceCandidate = new RTCIceCandidate(e.candidate);
      await pc1.addIceCandidate(iceCandidate);
      console.log('Add ice candidate to pc1', e.candidate);
    }
  });
  pc2.addEventListener('iceconnectionstatechange', e => {
    console.log('pc2 iceconnectionstatechange', e);
  });
  pc2.addEventListener('negotiationneeded', e => {
    console.log('pc2 negotiationneeded', e);
  });
  pc2.addEventListener('track', e => {
    console.log('pc2 track', e);
    if (e.track.kind === 'video') {
      console.log('video track');
      const video = document.querySelector<HTMLVideoElement>('.remote-video');
      console.log('remote-video', video);
      video.srcObject = e.streams[0];
    }
  }, false);

  // (2) Add video and audio track to pc1
  await getMedia(pc1);

  // (3) Create session description
  const offer = await pc1.createOffer();
  console.log('offer from pc1', offer);

  // (4) Set local description to pc1
  pc1.setLocalDescription(offer); // if we use await at the line nothing will work
  // and at the same time set remote description (same offer) for pc2
  // otherwise event handler for pc1 icecandidate event will fail
  // because we cannot add icecandidate to pc2 before set remote description for p2
  await pc2.setRemoteDescription(offer);

  // (6) Create answer from pc2
  const answer = await pc2.createAnswer();
  console.log('answer', answer);

  // (7) Set answer as local session description for pc2
  pc2.setLocalDescription(answer);
  // and at the same time set remote description (same answer) for pc1
  // otherwise event handler for pc2 icecandidate event will fail
  // because we cannot add icecandidate to pc1 before set remote description for it
  await pc1.setRemoteDescription(answer);

  // If we have a signaling server then we send the offer to it
  // And the signaling server send the offer to other peer (pc2) who want to establish a connection with pc1
  //   |
  //   |
  // the offer flies through the internet \-/ <-> - space ships /-\` - sheep
  //   |
  //   |
  /**
   * This is happening with the second user.
   */
  // User open some url that was gotten from the first user
  // Browser gets information about session description and
  // create pc2 is an instance of RTCPeerConnection. Get the offer from signaling server
  // then set it as remote description, create answer and set in as local description.
  // Then pc2 sends its icecandidates to signaling server and receives icecandidates of pc1
  // from signaling server.
}

async function getMedia(pc: RTCPeerConnection) {
  let stream = null;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { width: 640, height: 480 }
    });
    const video = document.querySelector<HTMLVideoElement>('.local-video');
    console.log('local-video', video);
    video.srcObject = stream;
    for (const track of stream.getTracks()) {
      pc.addTrack(track, stream);
      console.log('Added track', track);
    }
  } catch(err) {
    console.error('getMedia', err);
  }
}

async function createOffer(pc: RTCPeerConnection) {
  const offer = await pc.createOffer();
  console.log('createOffer', offer);
  return offer;
}
