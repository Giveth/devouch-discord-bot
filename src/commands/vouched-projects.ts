import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction,
  MessageFlags
} from 'discord.js';
import { getDeVouchAttestations } from '../services/devouch-service';
import { getProjectById } from '../services/giveth-service';
import { DEVOUCH_MIN_THRESHOLD, DEVOUCH_PROJECTS_LIMIT, DEVOUCH_TARGET_ORGANIZATION } from '../config';
import { Project } from '../types/giveth-types';

// Command definition
export const vouchedProjectsCommand = {
  data: new SlashCommandBuilder()
    .setName('vouched-projects')
    .setDescription('Find Giveth projects with the minimum threshold of vouches')
    .addIntegerOption(option =>
      option
        .setName('minimum-vouches')
        .setDescription('Minimum number of vouches from a Giveth Verifier')
        .setRequired(true)
        .setMinValue(1)
    ),
  
  execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
    try {
      // Defer the reply to give us time to fetch data
      await interaction.deferReply();
      
      // Get the threshold from the command options or use the default
      const userThreshold = interaction.options.getInteger('minimum-vouches');
      const threshold = userThreshold ?? DEVOUCH_MIN_THRESHOLD;
      
      // Fetch attestations from DeVouch API
      const attestationsResponse = await getDeVouchAttestations(
        DEVOUCH_PROJECTS_LIMIT,
        0,
        DEVOUCH_TARGET_ORGANIZATION
      );
      
      const attestations = attestationsResponse.data.projectAttestations;
      
      // Filter for projects with enough vouches
      const projectsWithEnoughVouches = attestations.filter(
        (attest) => attest.project.attests.length >= threshold
      );
      
      if (projectsWithEnoughVouches.length === 0) {
        await interaction.editReply(`No projects found with ${threshold}+ vouches from the specified organization.`);
        return;
      }
      
      // Track unverified projects
      const unverifiedProjects: Project[] = [];
      
      // Check verification status for each project
      for (const project of projectsWithEnoughVouches) {
        try {
          const projectResponse = await getProjectById(
            Number.parseInt(project.project.projectId)
          );
          
          if (!projectResponse.data.projectById.verified && projectResponse.data.projectById.status.name === "activate") {
            unverifiedProjects.push({
              title: projectResponse.data.projectById.title,
              slug: projectResponse.data.projectById.slug,
              id: projectResponse.data.projectById.id,
            });
          }
        } catch (error) {
          console.error(`Error fetching project ${project.project.projectId}:`, error);
          // Continue with other projects
        }
      }
      
      // Create response
      if (unverifiedProjects.length === 0) {
        await interaction.editReply(`No unverified & active projects found with ${threshold}+ vouches.`);
        return;
      }
      
      // Remove duplicate slugs
      const uniqueProjects = unverifiedProjects.reduce((acc: Project[], current) => {
        const isDuplicate = acc.find((item) => item.slug === current.slug);
        if (!isDuplicate) {
          acc.push(current);
        }
        return acc;
      }, []);

      // Create a formatted markdown response
      const header = `## Unverified & Active Projects with ${threshold}+ Vouches\n\n`;
      const intro = `The following projects have received enough vouches but are not yet verified:\n\n`;
      
      // Discord has a 2000 character limit per message
      const MAX_MESSAGE_LENGTH = 1900; // Leave some buffer
      
      // Send the header and intro in the first message
      let currentMessage = header + intro;
      let messageCount = 1;
      
      // Create project chunks that fit within Discord's character limit
      const projectMessages: string[] = [];
      
      // Add projects to messages, creating new ones when needed
      uniqueProjects.forEach((project) => {
        const projectLine = `- [${project.title}](https://devouch.xyz/project/giveth/${project.id}?organization=${DEVOUCH_TARGET_ORGANIZATION}=vouched)\n`;
        
        // If adding this project would exceed the limit, start a new message
        if (currentMessage.length + projectLine.length > MAX_MESSAGE_LENGTH) {
          projectMessages.push(currentMessage);
          currentMessage = projectLine;
          messageCount++;
        } else {
          currentMessage += projectLine;
        }
      });
      
      // Add the last message if it's not empty
      if (currentMessage) {
        projectMessages.push(currentMessage);
      }
      
      // Send the first message as a reply
      await interaction.editReply({
        content: projectMessages[0],
        flags: MessageFlags.SuppressEmbeds
      });
      
      // Send any additional messages as follow-ups
      for (let i = 1; i < projectMessages.length; i++) {
        await interaction.followUp({
          content: projectMessages[i],
          flags: MessageFlags.SuppressEmbeds
        });
      }
    } catch (error) {
      console.error('Error in vouched-projects command:', error);
      
      // Handle errors gracefully
      const errorMessage = error instanceof Error 
        ? `Error: ${error.message}` 
        : 'An unexpected error occurred';
      
      if (interaction.deferred) {
        await interaction.editReply(`Failed to fetch vouched projects. ${errorMessage}`);
      } else {
        await interaction.reply({
          content: `Failed to fetch vouched projects. ${errorMessage}`,
          ephemeral: true
        });
      }
    }
  }
};
