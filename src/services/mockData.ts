import { TohData } from '../types/device';

export const MOCK_TOH_DATA: TohData = {
    columns: [
        "deviceid", "brand", "model", "cpu", "cpumhz", "flashmb", "rammb",
        "target", "subtarget", "picture", "firmwareopenwrtinstallurl",
        "firmwareopenwrtupgradeurl", "supportedcurrentrel"
    ],
    entries: [
        [
            "raspberry_pi_4_model_b", "Raspberry Pi", "4 Model B", "Broadcom BCM2711", "1500", "0", "2048",
            "bcm27xx", "bcm2711", "https://openwrt.org/_media/toh/raspberry_pi_4_model_b.jpg",
            "https://downloads.openwrt.org/releases/23.05.0/targets/bcm27xx/bcm2711/openwrt-23.05.0-bcm27xx-bcm2711-rpi-4-ext4-factory.img.gz",
            "https://downloads.openwrt.org/releases/23.05.0/targets/bcm27xx/bcm2711/openwrt-23.05.0-bcm27xx-bcm2711-rpi-4-ext4-sysupgrade.img.gz",
            "23.05.0"
        ],
        [
            "gl.inet_gl-mt3000", "GL.iNet", "GL-MT3000", "MediaTek MT7981B", "1300", "256", "512",
            "mediatek", "filogic", "https://openwrt.org/_media/toh/gl.inet/gl-mt3000.jpg",
            "https://downloads.openwrt.org/releases/23.05.0/targets/mediatek/filogic/openwrt-23.05.0-mediatek-filogic-glinet_gl-mt3000-squashfs-factory.bin",
            "https://downloads.openwrt.org/releases/23.05.0/targets/mediatek/filogic/openwrt-23.05.0-mediatek-filogic-glinet_gl-mt3000-squashfs-sysupgrade.bin",
            "23.05.0"
        ],
        [
            "linksys_wrt3200acm", "Linksys", "WRT3200ACM", "Marvell Armada 385", "1600", "256", "512",
            "mvebu", "cortexa9", "",
            "",
            "",
            "23.05.0"
        ]
    ]
};
