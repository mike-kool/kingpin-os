// Phones offered in the phone frame: the five best-selling iPhones and five
// popular Android phones. Sizes are CSS viewport pixels in portrait at default
// display zoom, from yesviz.com/viewport and screensizechecker.com.

export interface Device {
  id: string;
  name: string;
  os: 'iOS' | 'Android';
  width: number;
  height: number;
}

export const DEVICES: Device[] = [
  { id: 'iphone-17', name: 'iPhone 17', os: 'iOS', width: 402, height: 874 },
  { id: 'iphone-17-pro', name: 'iPhone 17 Pro', os: 'iOS', width: 402, height: 874 },
  { id: 'iphone-17-pro-max', name: 'iPhone 17 Pro Max', os: 'iOS', width: 440, height: 956 },
  { id: 'iphone-16', name: 'iPhone 16', os: 'iOS', width: 393, height: 852 },
  { id: 'iphone-15-pro', name: 'iPhone 15 Pro', os: 'iOS', width: 393, height: 852 },
  { id: 'galaxy-s26-ultra', name: 'Galaxy S26 Ultra', os: 'Android', width: 412, height: 891 },
  { id: 'galaxy-s26', name: 'Galaxy S26', os: 'Android', width: 360, height: 780 },
  { id: 'galaxy-a36', name: 'Galaxy A36', os: 'Android', width: 412, height: 918 },
  { id: 'pixel-10', name: 'Pixel 10', os: 'Android', width: 412, height: 923 },
  { id: 'pixel-10-pro', name: 'Pixel 10 Pro', os: 'Android', width: 410, height: 914 },
];

export const DEFAULT_DEVICE_ID = 'iphone-17';

export function findDevice(id: string | null | undefined): Device {
  return DEVICES.find((d) => d.id === id) ?? DEVICES.find((d) => d.id === DEFAULT_DEVICE_ID)!;
}
