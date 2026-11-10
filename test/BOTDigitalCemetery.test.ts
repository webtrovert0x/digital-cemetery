import { expect } from "chai";
import { ethers } from "hardhat";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import type { BOTDigitalCemetery } from "../typechain-types";

describe("BOTDigitalCemetery", function () {
  async function deployFixture() {
    const [owner, alice, bob] = await ethers.getSigners();
    const Cemetery = await ethers.getContractFactory("BOTDigitalCemetery");
    const cemetery = (await Cemetery.deploy()) as BOTDigitalCemetery;
    await cemetery.waitForDeployment();
    return { cemetery, owner, alice, bob };
  }

  describe("buryProject", function () {
    it("successfully buries a project and stores all details", async function () {
      const { cemetery, alice } = await deployFixture();

      const tx = await cemetery
        .connect(alice)
        .buryProject("My 2024 startup idea", "Born in Figma. Died in production.");
      await tx.wait();

      expect(await cemetery.getTotalGraves()).to.equal(1n);
      expect(await cemetery.getTotalActiveGraves()).to.equal(1n);
      expect(await cemetery.getTotalDugUpGraves()).to.equal(0n);
      expect(await cemetery.getOwnerGraveCount(alice.address)).to.equal(1n);

      const grave = await cemetery.getGrave(1n);
      expect(grave.id).to.equal(1n);
      expect(grave.owner).to.equal(alice.address);
      expect(grave.projectName).to.equal("My 2024 startup idea");
      expect(grave.inscription).to.equal("Born in Figma. Died in production.");
      expect(grave.burialTimestamp).to.be.greaterThan(0n);
      expect(grave.isDugUp).to.equal(false);
      expect(await cemetery.getGraveStatus(1n)).to.equal(0n); // Active
    });

    it("rejects empty or whitespace-only project names", async function () {
      const { cemetery, alice } = await deployFixture();

      await expect(
        cemetery.connect(alice).buryProject("", "Valid epitaph")
      ).to.be.revertedWithCustomError(cemetery, "EmptyProjectName");

      await expect(
        cemetery.connect(alice).buryProject("   \t\n ", "Valid epitaph")
      ).to.be.revertedWithCustomError(cemetery, "EmptyProjectName");
    });

    it("rejects empty or whitespace-only inscriptions", async function () {
      const { cemetery, alice } = await deployFixture();

      await expect(
        cemetery.connect(alice).buryProject("Ghost App", "")
      ).to.be.revertedWithCustomError(cemetery, "EmptyInscription");

      await expect(
        cemetery.connect(alice).buryProject("Ghost App", "   \n ")
      ).to.be.revertedWithCustomError(cemetery, "EmptyInscription");
    });

    it("enforces project name (60 chars) and inscription (180 chars) length limits", async function () {
      const { cemetery, alice } = await deployFixture();

      const validName = "a".repeat(60);
      const validInscription = "b".repeat(180);
      await expect(
        cemetery.connect(alice).buryProject(validName, validInscription)
      ).to.not.be.reverted;

      // Supports multi-byte UTF-8 characters accurately up to 60 chars
      const emojiName = "🪦".repeat(60);
      await expect(
        cemetery.connect(alice).buryProject(emojiName, "RIP with emojis")
      ).to.not.be.reverted;

      const tooLongName = "a".repeat(61);
      await expect(
        cemetery.connect(alice).buryProject(tooLongName, "Valid inscription")
      )
        .to.be.revertedWithCustomError(cemetery, "ProjectNameTooLong")
        .withArgs(61n, 60n);

      const tooLongInscription = "b".repeat(181);
      await expect(
        cemetery.connect(alice).buryProject("Valid Name", tooLongInscription)
      )
        .to.be.revertedWithCustomError(cemetery, "InscriptionTooLong")
        .withArgs(181n, 180n);
    });

    it("assigns unique incrementing grave IDs and tracks owner records", async function () {
      const { cemetery, alice, bob } = await deployFixture();

      await cemetery.connect(alice).buryProject("Portfolio v1", "Never deployed");
      await cemetery.connect(bob).buryProject("Gym membership", "Went twice in January");
      await cemetery.connect(alice).buryProject("Abandoned React app", "Too many useEffects");

      expect(await cemetery.getTotalGraves()).to.equal(3n);
      expect(await cemetery.getOwnerGraveCount(alice.address)).to.equal(2n);
      expect(await cemetery.getOwnerGraveCount(bob.address)).to.equal(1n);

      const aliceIds = await cemetery.getGravesByOwner(alice.address);
      const bobIds = await cemetery.getGravesByOwner(bob.address);
      expect(aliceIds).to.deep.equal([1n, 3n]);
      expect(bobIds).to.deep.equal([2n]);

      const grave1 = await cemetery.getGrave(1n);
      const grave2 = await cemetery.getGrave(2n);
      const grave3 = await cemetery.getGrave(3n);
      expect(grave1.id).to.equal(1n);
      expect(grave2.id).to.equal(2n);
      expect(grave3.id).to.equal(3n);
      expect(grave1.owner).to.equal(alice.address);
      expect(grave2.owner).to.equal(bob.address);
      expect(grave3.owner).to.equal(alice.address);
    });

    it("emits ProjectBuried with indexed ID, owner, name, and timestamp", async function () {
      const { cemetery, alice } = await deployFixture();

      await expect(
        cemetery
          .connect(alice)
          .buryProject("The book I promised to write", "Chapter 1 forever pending")
      )
        .to.emit(cemetery, "ProjectBuried")
        .withArgs(1n, alice.address, "The book I promised to write", anyValue);
    });
  });

  describe("digUp", function () {
    it("allows the original owner to dig up a grave and preserves history", async function () {
      const { cemetery, alice } = await deployFixture();

      await cemetery
        .connect(alice)
        .buryProject("My abandoned NFT marketplace", "Born in Figma. Died in production.");

      const beforeDig = await cemetery.getGrave(1n);

      await expect(cemetery.connect(alice).digUp(1n))
        .to.emit(cemetery, "ProjectDugUp")
        .withArgs(1n, alice.address, anyValue);

      const afterDig = await cemetery.getGrave(1n);
      expect(afterDig.id).to.equal(beforeDig.id);
      expect(afterDig.owner).to.equal(beforeDig.owner);
      expect(afterDig.projectName).to.equal(beforeDig.projectName);
      expect(afterDig.inscription).to.equal(beforeDig.inscription);
      expect(afterDig.burialTimestamp).to.equal(beforeDig.burialTimestamp);
      expect(afterDig.isDugUp).to.equal(true);

      expect(await cemetery.getGraveStatus(1n)).to.equal(1n); // DugUp
      expect(await cemetery.getTotalGraves()).to.equal(1n);
      expect(await cemetery.getTotalActiveGraves()).to.equal(0n);
      expect(await cemetery.getTotalDugUpGraves()).to.equal(1n);
    });

    it("prevents unauthorized wallets from digging up someone else's grave", async function () {
      const { cemetery, alice, bob } = await deployFixture();

      await cemetery.connect(alice).buryProject("Secret Side Project", "Gone too soon");

      await expect(cemetery.connect(bob).digUp(1n))
        .to.be.revertedWithCustomError(cemetery, "NotGraveOwner")
        .withArgs(1n, bob.address);

      expect((await cemetery.getGrave(1n)).isDugUp).to.equal(false);
    });

    it("prevents digging up nonexistent graves", async function () {
      const { cemetery, alice } = await deployFixture();

      await expect(cemetery.connect(alice).digUp(0n))
        .to.be.revertedWithCustomError(cemetery, "GraveNotFound")
        .withArgs(0n);

      await expect(cemetery.connect(alice).digUp(999n))
        .to.be.revertedWithCustomError(cemetery, "GraveNotFound")
        .withArgs(999n);
    });

    it("prevents repeated dig-up of an already dug-up grave", async function () {
      const { cemetery, alice } = await deployFixture();

      await cemetery.connect(alice).buryProject("Zombie App", "Back from the dead");
      await cemetery.connect(alice).digUp(1n);

      await expect(cemetery.connect(alice).digUp(1n))
        .to.be.revertedWithCustomError(cemetery, "GraveAlreadyDugUp")
        .withArgs(1n);
    });
  });

  describe("views and pagination", function () {
    it("reverts getGrave and getGraveStatus for nonexistent grave IDs", async function () {
      const { cemetery } = await deployFixture();

      await expect(cemetery.getGrave(0n))
        .to.be.revertedWithCustomError(cemetery, "GraveNotFound")
        .withArgs(0n);

      await expect(cemetery.getGraveStatus(1n))
        .to.be.revertedWithCustomError(cemetery, "GraveNotFound")
        .withArgs(1n);
    });

    it("paginates graves newest-first and oldest-first cleanly", async function () {
      const { cemetery, alice, bob } = await deployFixture();

      await cemetery.connect(alice).buryProject("Project 1", "First");
      await cemetery.connect(bob).buryProject("Project 2", "Second");
      await cemetery.connect(alice).buryProject("Project 3", "Third");
      await cemetery.connect(bob).buryProject("Project 4", "Fourth");

      const [newestPage1, total1] = await cemetery.getGravesPaginated(0n, 2n, true);
      expect(total1).to.equal(4n);
      expect(newestPage1.map((g) => g.id)).to.deep.equal([4n, 3n]);

      const [newestPage2] = await cemetery.getGravesPaginated(2n, 2n, true);
      expect(newestPage2.map((g) => g.id)).to.deep.equal([2n, 1n]);

      const [oldestPage1] = await cemetery.getGravesPaginated(0n, 3n, false);
      expect(oldestPage1.map((g) => g.id)).to.deep.equal([1n, 2n, 3n]);

      const [emptyPage] = await cemetery.getGravesPaginated(10n, 2n, true);
      expect(emptyPage.length).to.equal(0);

      const [alicePage, aliceTotal] = await cemetery.getGravesByOwnerPaginated(
        alice.address,
        0n,
        5n,
        true
      );
      expect(aliceTotal).to.equal(2n);
      expect(alicePage.map((g) => g.id)).to.deep.equal([3n, 1n]);
    });
  });
});

