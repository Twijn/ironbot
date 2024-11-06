const {EmbedBuilder} = require('discord.js');
const io = require("@pm2/io");

const utils = require("../utils");

const REQUIRED_PROMOTION_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days (1 week)

const REQUIRED_MESSAGES_ONLY = 50;

const REQUIRED_MESSAGES = 20;
const REQUIRED_VC_TIME = 10 * 60; // 10 minutes

const run = async cb => {
    const membersByRole = await utils.MemberManager.getMembersByRole(true);
    const memberRole = membersByRole.find(x => x.role.position === 1);
    const promotionRole = membersByRole.find(x => x.role.position === 2);

    const error = err => {
        err = "[Promote] " + err;
        console.error(err)
        cb({ok: false, error: err});
    }

    const log = msg => {
        console.log("[Promote] " + msg);
    }

    if (!memberRole) {
        return error("Unable to find member role!");
    }

    if (!promotionRole) {
        return error("Unable to find promotion role!");
    }

    log(`Using ${memberRole.role.name} as member role and ${promotionRole.role.name} as promotion role`);

    log(`Got ${memberRole.members.length} users with role '${memberRole.role.name}'`)

    const promotions = [];

    for (let i = 0; i < memberRole.members.length; i++) {
        const member = memberRole.members[i];

        if (Date.now() - member.joinedTimestamp.getTime() < REQUIRED_PROMOTION_TIME) {
            log(`Skipping member ${member.globalName}: missing required promotion time`);
            continue;
        }

        const identity = await member.createIdentity();

        const messageCount = await identity.getMessageCount();
        const vcTime = await identity.getVCTime();

        if (messageCount >= REQUIRED_MESSAGES_ONLY) {
            log(`Promoting member ${member.globalName}: has ${messageCount}/${REQUIRED_MESSAGES_ONLY} messages and time in guild`);
            promotions.push({member, messageCount, vcTime});
            continue;
        }

        if (messageCount >= REQUIRED_MESSAGES && vcTime >= REQUIRED_VC_TIME) {
            log(`Promoting member ${member.globalName}: has ${messageCount}/${REQUIRED_MESSAGES} messages, ${vcTime}/${REQUIRED_VC_TIME} VC time and time in guild`);
            promotions.push({member, messageCount, vcTime});
            continue;
        }

        log(`Not promoting member ${member.globalName}: only has ${messageCount} messages and ${vcTime} VC time`);
    }

    if (promotions.length === 0) {
        return cb({ok:true});
    }

    let messages = [];
    for (let i = 0; i < promotions.length; i++) {
        const {member, messageCount, vcTime} = promotions[i];
        try {
            const discordMember = await utils.MemberManager.getMember(member.id);
            await discordMember.roles.add(promotionRole.role.id);

            messages.push(`- <@${discordMember.id}> joined <t:${Math.floor(discordMember.joinedTimestamp / 1000)}:R> with \`${utils.comma(messageCount)} message${messageCount === 1 ? "" : "s"}\` sent and \`${utils.relativeTime(vcTime)}\` spent in voice channels!`);
        } catch(err) {
            console.error(`Error while promoting ${member.globalName}:`);
            console.error(err);
        }
    }

    const embed = new EmbedBuilder()
        .setColor(0xf28227)
        .setTitle("Guild Promotion!")
        .setDescription(
            `**The following members have been promoted to <@&${promotionRole.role.id}>!**\n\n` +
            messages.join("\n") +
            `\n\n***🎉 Congratulations! 🎉***`
        )
        .setFooter({iconURL: "https://www.illumindal.com/assets/images/icons/illumindal_120px.png", text: "The Illumindal Guild"});

    utils.channels.promotions.send({
        content: promotions.map(x => `<@${x.member.id}>`).join(" "),
        embeds: [embed],
    }).then(message => {
        message.react("🎉").catch(console.error);
        cb({ok: true});
    }, err => {
        console.error(err);
        cb({ok: false});
    });
}

io.action("reputation/promoteMembersToSeekers", run);
