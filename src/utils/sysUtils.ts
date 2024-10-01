import * as os from 'os';
import * as si from 'systeminformation';

const formatGB = (bytes: number): string => {
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

// Returns the system's total and available memory
export function getSystemMemory() {
  const totalMemory = formatGB(os.totalmem());
  const freeMemory = formatGB(os.freemem());
  return { totalMemory, freeMemory };
}

// Returns the system's total number of CPUs
export function getSystemCPUs() {
  return os.cpus().length;
}

// Returns the system's available disk space
interface DiskSpace {
  mount: string;
  totalDiskSpace: string;
  freeDiskSpace: string;
}

export async function getSystemDiskSpace() {
  try {
    const fsSize = await si.fsSize();
    const mainVolume = fsSize.find(drive =>
      process.platform === 'win32'
        ? drive.mount.toLowerCase().includes('c:')
        : drive.mount === '/'
    );
    if (mainVolume) {
      const totalDiskSpace = mainVolume.size;
      const freeDiskSpace = mainVolume.available;
      return { mount: mainVolume.mount, totalDiskSpace: formatGB(totalDiskSpace), freeDiskSpace: formatGB(freeDiskSpace) };
    }
    console.error('Main volume not found');
  } catch (error) {
    console.error('Error getting disk space:', error);
  }
  return { mount: "Unknown", totalDiskSpace: "Unknown", freeDiskSpace: "Unknown" };
}

// Returns the system's available GPUs
export async function getSystemGPUs() {
  try {
    //FIXME apparently it only works on Mac
    const gpus = await si.graphics();
    const cores = gpus.controllers.length ? gpus.controllers[0].cores : 0;
    return cores ? cores : 0;
  } catch (error) {
    console.error('Error detecting GPUs:', error);
    return 0;
  }
}

// Returns all the system's information
interface SystemInfo {
  memory: {
    totalMemory: string;
    freeMemory: string;
  };
  cpus: number;
  diskSpace: DiskSpace;
  gpus: number;
}

export async function getSystemInfo(): Promise<SystemInfo> {
  const memory = getSystemMemory();
  const cpus = getSystemCPUs();
  const diskSpace = await getSystemDiskSpace();
  const gpus = await getSystemGPUs();
  return { cpus, gpus, diskSpace, memory };
}
